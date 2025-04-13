async function handler({
  method,
  search,
  sortBy,
  sortOrder,
  name,
  email,
  address,
  ownerId,
}) {
  const session = getSession();

  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const [user] = await sql`
    SELECT role FROM users 
    WHERE email = ${session.user.email}
  `;

  if (!user || user.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  if (method === "GET") {
    let queryStr = `
      SELECT 
        s.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 0;

    if (search) {
      queryStr += ` AND (
        LOWER(s.name) LIKE LOWER($${++paramCount}) OR
        LOWER(s.email) LIKE LOWER($${++paramCount}) OR
        LOWER(s.address) LIKE LOWER($${++paramCount})
      )`;
      const searchPattern = `%${search}%`;
      values.push(searchPattern, searchPattern, searchPattern);
    }

    queryStr += ` GROUP BY s.id`;

    if (
      sortBy &&
      ["name", "email", "address", "average_rating"].includes(sortBy)
    ) {
      queryStr += ` ORDER BY ${sortBy} ${
        sortOrder === "desc" ? "DESC" : "ASC"
      }`;
    }

    const stores = await sql(queryStr, values);
    return { stores };
  }

  if (method === "POST") {
    if (!name || name.length < 20 || name.length > 60) {
      return { error: "Name must be between 20 and 60 characters" };
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: "Invalid email format" };
    }

    if (!address || address.length > 400) {
      return { error: "Address must not exceed 400 characters" };
    }

    try {
      const [store] = await sql`
        INSERT INTO stores (name, email, address, owner_id)
        VALUES (${name}, ${email}, ${address}, ${ownerId})
        RETURNING *
      `;
      return { store };
    } catch (error) {
      if (error.code === "23505") {
        return { error: "Email already exists" };
      }
      return { error: "Failed to create store" };
    }
  }

  return { error: "Method not allowed" };
}
