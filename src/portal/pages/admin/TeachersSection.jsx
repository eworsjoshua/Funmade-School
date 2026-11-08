import { useState } from "react";
import { api, errorMessages } from "../../api/client";
import { useApi } from "../../lib/useApi";

export default function TeachersSection() {
  const [search, setSearch] = useState("");
  const teachers = useApi(`/api/teachers/${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  const users = useApi("/api/auth/users/?role=teacher");

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [formData, setFormData] = useState({
    user: "",
    staff_id: "",
    phone: "",
    address: "",
    qualification: "",
    date_hired: new Date().toISOString().split("T")[0],
  });
  const [formErrors, setFormErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const teacherList = teachers.data?.results || (Array.isArray(teachers.data) ? teachers.data : []);

  const teacherUserIds = new Set(teacherList.map((t) => t.user));
  const availableUsers = (users.data || []).filter(
    (u) => modalMode === "edit" || !teacherUserIds.has(u.id)
  );

  function openCreate() {
    setFormErrors([]);
    setFormData({
      user: availableUsers[0]?.id || "",
      staff_id: `TCH-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      phone: "",
      address: "",
      qualification: "B.Ed",
      date_hired: new Date().toISOString().split("T")[0],
    });
    setModalMode("create");
  }

  function openEdit(teacher) {
    setFormErrors([]);
    setCurrentTeacher(teacher);
    setFormData({
      user: teacher.user,
      staff_id: teacher.staff_id || "",
      phone: teacher.phone || "",
      address: teacher.address || "",
      qualification: teacher.qualification || "",
      date_hired: teacher.date_hired || "",
    });
    setModalMode("edit");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormErrors([]);
    try {
      if (modalMode === "create") {
        await api("/api/teachers/", { method: "POST", body: formData });
        setStatusMessage("Teacher profile created successfully.");
      } else if (modalMode === "edit") {
        await api(`/api/teachers/${currentTeacher.id}/`, { method: "PATCH", body: formData });
        setStatusMessage("Teacher profile updated successfully.");
      }
      setModalMode(null);
      teachers.reload();
      setTimeout(() => setStatusMessage(""), 4000);
    } catch (err) {
      setFormErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(teacher) {
    const name = teacher.user_info
      ? `${teacher.user_info.first_name} ${teacher.user_info.last_name}`
      : teacher.staff_id;
    if (!window.confirm(`Are you sure you want to delete teacher profile for ${name}?`)) return;
    try {
      await api(`/api/teachers/${teacher.id}/`, { method: "DELETE" });
      setStatusMessage("Teacher profile deleted.");
      teachers.reload();
      setTimeout(() => setStatusMessage(""), 4000);
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

      {/* Header & Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h2 className="h4 fw-bold mb-1">Teacher Records</h2>
          <p className="text-muted small mb-0">Manage teaching staff profiles, staff IDs, and qualifications.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          + Add Teacher Record
        </button>
      </div>

      {/* Search Bar */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search teachers by name or staff ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4 text-md-end">
              <span className="badge bg-secondary-subtle text-secondary-emphasis">
                {teacherList.length} {teacherList.length === 1 ? "teacher record" : "teacher records"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Staff ID</th>
                <th>Teacher Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Qualification</th>
                <th>Date Hired</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.loading && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" /> Loading teacher records…
                  </td>
                </tr>
              )}
              {teachers.error && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-danger">
                    {teachers.error.message}
                  </td>
                </tr>
              )}
              {!teachers.loading && teacherList.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No teacher records found. Click "+ Add Teacher Record" to create one.
                  </td>
                </tr>
              )}
              {teacherList.map((t) => {
                const name = t.user_info
                  ? [t.user_info.first_name, t.user_info.last_name].filter(Boolean).join(" ") || t.user_info.username
                  : `User #${t.user}`;
                return (
                  <tr key={t.id}>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-semibold">
                        {t.staff_id}
                      </span>
                    </td>
                    <td className="fw-semibold">{name}</td>
                    <td className="text-muted small">{t.user_info?.email || "—"}</td>
                    <td>{t.phone || "—"}</td>
                    <td><span className="badge bg-light text-dark border">{t.qualification || "—"}</span></td>
                    <td className="text-muted small">{t.date_hired || "—"}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" onClick={() => openEdit(t)}>
                          Edit
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => handleDelete(t)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    {modalMode === "create" ? "Add Teacher Record" : "Edit Teacher Record"}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setModalMode(null)} />
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
                    <label className="form-label small fw-semibold">Associated User Account *</label>
                    <select
                      className="form-select form-select-sm"
                      required
                      disabled={modalMode === "edit"}
                      value={formData.user}
                      onChange={(e) => setFormData({ ...formData, user: Number(e.target.value) })}
                    >
                      <option value="">-- Select Teacher User Account --</option>
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username} ({u.first_name} {u.last_name || ""})
                        </option>
                      ))}
                    </select>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      Only users registered with role "teacher" are listed.
                    </small>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Staff ID *</label>
                      <input
                        className="form-control form-control-sm"
                        required
                        value={formData.staff_id}
                        onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Qualification</label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="e.g. B.Sc, B.Ed, M.Sc"
                        value={formData.qualification}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        className="form-control form-control-sm"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Date Hired</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={formData.date_hired}
                        onChange={(e) => setFormData({ ...formData, date_hired: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Address</label>
                    <input
                      className="form-control form-control-sm"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalMode(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? "Saving…" : modalMode === "create" ? "Create Record" : "Save Changes"}
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
