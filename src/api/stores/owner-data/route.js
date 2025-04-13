async function handler() {
  const session = getSession();

  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const [user] = await sql`
    SELECT id, role FROM users 
    WHERE email = ${session.user.email}
  `;

  if (!user || user.role !== "STORE_OWNER") {
    return { error: "Store owner access required" };
  }

  const [store] = await sql`
    SELECT id, name, email, address 
    FROM stores 
    WHERE owner_id = ${user.id}
  `;

  if (!store) {
    return { error: "No store found" };
  }

  const [ratingStats] = await sql`
    SELECT 
      COALESCE(AVG(rating), 0) as average_rating,
      COUNT(*) as total_ratings
    FROM ratings 
    WHERE store_id = ${store.id}
  `;

  const recentRatings = await sql`
    SELECT 
      r.id,
      r.rating,
      r.created_at,
      u.name as user_name
    FROM ratings r
    JOIN users u ON u.id = r.user_id
    WHERE r.store_id = ${store.id}
    ORDER BY r.created_at DESC
    LIMIT 10
  `;

  return {
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
    },
    averageRating: Number(ratingStats.average_rating),
    totalRatings: Number(ratingStats.total_ratings),
    recentRatings: recentRatings.map((rating) => ({
      id: rating.id,
      rating: rating.rating,
      userName: rating.user_name,
      createdAt: rating.created_at,
    })),
  };
}
