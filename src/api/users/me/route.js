async function handler() {
  const session = getSession();

  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const [user] = await sql`
    SELECT 
      users.id,
      users.email,
      users.name,
      users.address,
      users.role,
      users.created_at,
      users.updated_at
    FROM users
    WHERE users.email = ${session.user.email}
  `;

  if (!user) {
    return { error: "User not found", status: 404 };
  }

  return user;
}
