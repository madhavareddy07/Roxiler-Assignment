async function handler() {
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

  const [{ total_users }] = await sql`
    SELECT COUNT(*) as total_users FROM users
  `;

  const [{ total_stores }] = await sql`
    SELECT COUNT(*) as total_stores FROM stores
  `;

  const [{ total_ratings }] = await sql`
    SELECT COUNT(*) as total_ratings FROM ratings
  `;

  return {
    totalUsers: total_users,
    totalStores: total_stores,
    totalRatings: total_ratings,
  };
}
