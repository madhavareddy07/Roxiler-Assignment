"use client";
import React from "react";

function MainComponent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { data: user, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && user?.role !== "ADMIN") {
      window.location.href = "/";
      return;
    }
    fetchUsers();
  }, [user, userLoading, sortField, sortDirection, filters]);

  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        sortField,
        sortDirection,
      });
      const response = await fetch(`/api/admin/users?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (
      !formData.name ||
      formData.name.length < 20 ||
      formData.name.length > 60
    ) {
      errors.name = "Name must be between 20 and 60 characters";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (
      !formData.password ||
      !/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16})/.test(formData.password)
    ) {
      errors.password =
        "Password must be 8-16 characters with 1 uppercase and 1 special character";
    }
    if (!formData.address || formData.address.length > 400) {
      errors.address = "Address must not exceed 400 characters";
    }
    if (!["ADMIN", "USER", "STORE_OWNER"].includes(formData.role)) {
      errors.role = "Please select a valid role";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setFormSubmitting(true);
      try {
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to create user");
        }

        setFormData({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "USER",
        });
        fetchUsers();
      } catch (err) {
        console.error(err);
        setError("Failed to create user");
      } finally {
        setFormSubmitting(false);
      }
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">Manage Users</h1>

        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Add New User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.password}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
                rows="3"
              />
              {formErrors.address && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.address}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
              >
                <option value="USER">User</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="ADMIN">Admin</option>
              </select>
              {formErrors.role && (
                <p className="mt-1 text-sm text-red-500">{formErrors.role}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={formSubmitting}
              className="rounded-lg bg-[#357AFF] px-4 py-2 text-white hover:bg-[#2E69DE] focus:outline-none focus:ring-2 focus:ring-[#357AFF] focus:ring-offset-2 disabled:opacity-50"
            >
              {formSubmitting ? "Adding..." : "Add User"}
            </button>
          </form>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="Filter by name"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="rounded-lg border border-gray-300 p-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
            />
            <input
              type="text"
              placeholder="Filter by email"
              value={filters.email}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
              className="rounded-lg border border-gray-300 p-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
            />
            <input
              type="text"
              placeholder="Filter by address"
              value={filters.address}
              onChange={(e) =>
                setFilters({ ...filters, address: e.target.value })
              }
              className="rounded-lg border border-gray-300 p-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
            />
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="rounded-lg border border-gray-300 p-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center">Loading users...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th
                      className="cursor-pointer p-4 hover:bg-gray-50"
                      onClick={() => handleSort("name")}
                    >
                      Name{" "}
                      {sortField === "name" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="cursor-pointer p-4 hover:bg-gray-50"
                      onClick={() => handleSort("email")}
                    >
                      Email{" "}
                      {sortField === "email" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="cursor-pointer p-4 hover:bg-gray-50"
                      onClick={() => handleSort("address")}
                    >
                      Address{" "}
                      {sortField === "address" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="cursor-pointer p-4 hover:bg-gray-50"
                      onClick={() => handleSort("role")}
                    >
                      Role{" "}
                      {sortField === "role" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    {users.some((user) => user.role === "STORE_OWNER") && (
                      <th
                        className="cursor-pointer p-4 hover:bg-gray-50"
                        onClick={() => handleSort("storeRating")}
                      >
                        Store Rating{" "}
                        {sortField === "storeRating" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{user.address}</td>
                      <td className="p-4">{user.role}</td>
                      {users.some((u) => u.role === "STORE_OWNER") && (
                        <td className="p-4">
                          {user.role === "STORE_OWNER" && user.store && (
                            <div>
                              <span className="text-yellow-500">
                                {"★".repeat(
                                  Math.round(user.store.averageRating)
                                )}
                              </span>
                              <span className="ml-2 text-sm text-gray-600">
                                ({user.store.averageRating.toFixed(1)})
                              </span>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
