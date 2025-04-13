async function handler({ search }) {
  const session = getSession();

  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const [user] = await sql`
    SELECT id FROM users 
    WHERE email = ${session.user.email}
  `;

  if (!user) {
    return { error: "User not found" };
  }

  let queryString = `
    SELECT 
      s.id,
      s.name,
      s.address,
      s.email,
      COALESCE(AVG(r.rating), 0) as average_rating,
      COUNT(r.id) as total_ratings,
      ur.rating as user_rating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
  `;

  const values = [user.id];
  let paramCount = 1;

  if (search) {
    queryString += `
      WHERE 
        LOWER(s.name) LIKE LOWER($${paramCount + 1}) OR 
        LOWER(s.address) LIKE LOWER($${paramCount + 1})
    `;
    values.push(`%${search}%`);
  }

  queryString += `
    GROUP BY s.id, s.name, s.address, s.email, ur.rating
    ORDER BY s.name
  `;

  const stores = await sql(queryString, values);

  return stores.map((store) => ({
    id: store.id,
    name: store.name,
    address: store.address,
    email: store.email,
    averageRating: Number(store.average_rating),
    totalRatings: Number(store.total_ratings),
    userRating: store.user_rating ? Number(store.user_rating) : null,
  }));
}
