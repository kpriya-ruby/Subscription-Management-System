// Demo login until the Flask authentication endpoint is ready.
export async function loginDemo(email, _password, selectedRole = "admin") {
  const role = selectedRole || "admin";
  return {
    user: {
      id: 1,
      name: email?.split("@")[0] || "Brightloop User",
      email,
      role,
    },
  };
}
