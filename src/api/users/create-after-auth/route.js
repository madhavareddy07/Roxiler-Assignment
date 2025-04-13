async function handler({ auth_user_id }) {
  const session = getSession();

  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const [existingUser] = await sql`
    SELECT id FROM users WHERE auth_user_id = ${auth_user_id}
  `;

  if (existingUser) {
    return { error: "User already exists" };
  }

  const [authUser] = await sql`
    SELECT email, name FROM auth_users WHERE id = ${auth_user_id}
  `;

  if (!authUser) {
    return { error: "Auth user not found" };
  }

  const [newUser] = await sql`
    INSERT INTO users (email, name, auth_user_id, role)
    VALUES (${authUser.email}, ${authUser.name}, ${auth_user_id}, 'USER')
    RETURNING id, email, name, role
  `;

  return newUser;
}
