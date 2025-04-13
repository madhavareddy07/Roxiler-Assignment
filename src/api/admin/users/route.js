async function handler({
  method,
  email,
  password,
  name,
  address,
  role,
  filters,
  sort,
}) {
  const session = getSession();

  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const [currentUser] = await sql`
    SELECT role FROM users 
    WHERE email = ${session.user.email}
  `;

  if (!currentUser?.role === "ADMIN") {
    return { error: "Admin access required" };
  }

  if (method === "GET") {
    let query =
      "SELECT u.*, COALESCE(avg_rating, 0) as store_rating FROM users u LEFT JOIN (SELECT s.owner_id, AVG(r.rating) as avg_rating FROM stores s LEFT JOIN ratings r ON s.id = r.store_id GROUP BY s.owner_id) ratings ON u.id = ratings.owner_id WHERE 1=1";
    const values = [];
    let paramCount = 0;

    if (filters?.name) {
      paramCount++;
      query += ` AND LOWER(name) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.name}%`);
    }

    if (filters?.email) {
      paramCount++;
      query += ` AND LOWER(email) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.email}%`);
    }

    if (filters?.address) {
      paramCount++;
      query += ` AND LOWER(address) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.address}%`);
    }

    if (filters?.role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      values.push(filters.role);
    }

    if (sort?.field && sort?.direction) {
      query += ` ORDER BY ${sort.field} ${
        sort.direction === "desc" ? "DESC" : "ASC"
      }`;
    }

    const users = await sql(query, values);
    return { users };
  }

  if (method === "POST") {
    if (!name || name.length < 20 || name.length > 60) {
      return { error: "Name must be between 20 and 60 characters" };
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: "Invalid email format" };
    }

    if (
      !password ||
      !/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8,16}$/.test(password)
    ) {
      return {
        error:
          "Password must be 8-16 characters with at least 1 uppercase letter and 1 special character",
      };
    }

    if (!address || address.length > 400) {
      return { error: "Address must not exceed 400 characters" };
    }

    if (!["ADMIN", "USER", "STORE_OWNER"].includes(role)) {
      return { error: "Invalid role" };
    }

    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser) {
      return { error: "Email already exists" };
    }

    const [newUser] = await sql`
      INSERT INTO users (name, email, password_hash, address, role)
      VALUES (${name}, ${email}, ${password}, ${address}, ${role}::user_role)
      RETURNING id, name, email, address, role
    `;

    return { user: newUser };
  }

  return { error: "Method not allowed" };
}
