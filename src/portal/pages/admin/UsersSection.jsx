import { useState } from "react";
import { api, errorMessages } from "../../api/client";
import { useApi } from "../../lib/useApi";

export default function UsersSection() {
  const users = useApi("/api/auth/users/");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [formErrors, setFormErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // New user form state
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    role: "student",
  });

  const list = (users.data || []).filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.username?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  async function handleRegister(e) {
    e.preventDefault();
    setSaving(true);
    setFormErrors([]);
    try {
      await api("/api/auth/register/", { method: "POST", body: newUser });
      setShowAddModal(false);
      setNewUser({ username: "", email: "", first_name: "", last_name: "", password: "", role: "student" });
      setStatusMessage("User registered successfully.");
      users.reload();
      setTimeout(() => setStatusMessage(""), 4000);
    } catch (err) {
      setFormErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setSaving(true);
    setFormErrors([]);
    try {
      await api(`/api/auth/users/${passwordModalUser.id}/set-password/`, {
        method: "POST",
        body: { new_password: newPassword },
      });
      setPasswordModalUser(null);
      setNewPassword("");
      setStatusMessage("Password updated successfully.");
      setTimeout(() => setStatusMessage(""), 4000);
    } catch (err) {
      setFormErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user) {
    try {
      await api(`/api/auth/users/${user.id}/`, {
        method: "PATCH",
        body: { is_active: !user.is_active },
      });
      users.reload();
    } catch (err) {
      alert(errorMessages(err).join("\n"));
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Are you sure you want to delete user ${user.username}?`)) return;
    try {
      await api(`/api/auth/users/${user.id}/`, { method: "DELETE" });
      users.reload();
    } catch (err) {
      alert(errorMessages(err).join("\n"));
    }
  }

  return (
    <div className="space-y-4">
      {statusMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {statusMessage}
        </div>
      )}

      {/* Header & Controls */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h2 className="h4 fw-bold mb-1">User Accounts</h2>
          <p className="text-muted small mb-0">Manage credentials and login roles for administrators, teachers, and students.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setFormErrors([]); setShowAddModal(true); }}>
          + Register New User
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by username, name, or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select form-select-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
              </select>
            </div>
            <div className="col-md-2 text-md-end">
              <span className="badge bg-secondary-subtle text-secondary-emphasis">
                {list.length} {list.length === 1 ? "user" : "users"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.loading && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" /> Loading user accounts…
                  </td>
                </tr>
              )}
              {users.error && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-danger">
                    {users.error.message}
                  </td>
                </tr>
              )}
              {!users.loading && list.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No users found matching your search.
                  </td>
                </tr>
              )}
              {list.map((u) => (
                <tr key={u.id}>
                  <td className="text-muted small">#{u.id}</td>
                  <td className="fw-semibold">{u.username}</td>
                  <td>{[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}</td>
                  <td className="text-muted small">{u.email || "—"}</td>
                  <td>
                    <span
                      className={`badge text-capitalize ${
                        u.role === "admin"
                          ? "bg-danger-subtle text-danger"
                          : u.role === "teacher"
                          ? "bg-primary-subtle text-primary"
                          : "bg-success-subtle text-success"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? "bg-success" : "bg-secondary"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-secondary"
                        title="Set Password"
                        onClick={() => {
                          setFormErrors([]);
                          setPasswordModalUser(u);
                        }}
                      >
                        Reset Pwd
                      </button>
                      <button
                        className={`btn ${u.is_active ? "btn-outline-warning" : "btn-outline-success"}`}
                        title={u.is_active ? "Deactivate" : "Activate"}
                        onClick={() => toggleActive(u)}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        title="Delete"
                        onClick={() => handleDelete(u)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register User Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleRegister}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Register New User</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} />
                </div>
                <div className="modal-body">
                  {formErrors.length > 0 && (
                    <div className="alert alert-danger py-2 small mb-3">
                      <ul className="mb-0 ps-3">
                        {formErrors.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="row g-2 mb-2">
                    <div className="col">
                      <label className="form-label small">First Name</label>
                      <input
                        className="form-control form-control-sm"
                        value={newUser.first_name}
                        onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label small">Last Name</label>
                      <input
                        className="form-control form-control-sm"
                        value={newUser.last_name}
                        onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Username *</label>
                    <input
                      className="form-control form-control-sm"
                      required
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Role *</label>
                    <select
                      className="form-select form-select-sm"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Password *</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      Must be at least 8 characters and not too common.
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? "Creating…" : "Register Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {passwordModalUser && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleResetPassword}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Reset Password for {passwordModalUser.username}</h5>
                  <button type="button" className="btn-close" onClick={() => setPasswordModalUser(null)} />
                </div>
                <div className="modal-body">
                  {formErrors.length > 0 && (
                    <div className="alert alert-danger py-2 small mb-3">
                      <ul className="mb-0 ps-3">
                        {formErrors.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label small">New Password *</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPasswordModalUser(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? "Saving…" : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
