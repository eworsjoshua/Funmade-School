import { useState } from "react";
import { api, errorMessages } from "../../api/client";
import { useApi } from "../../lib/useApi";

export default function StudentsSection() {
  const [search, setSearch] = useState("");
  const students = useApi(`/api/students/${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  const users = useApi("/api/auth/users/?role=student");

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | null
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({
    user: "",
    admission_number: "",
    date_of_birth: "",
    gender: "male",
    phone: "",
    address: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_email: "",
    date_admitted: new Date().toISOString().split("T")[0],
  });
  const [formErrors, setFormErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const studentList = students.data?.results || (Array.isArray(students.data) ? students.data : []);

  // Filter out users who already have student profiles for create mode
  const studentUserIds = new Set(studentList.map((s) => s.user));
  const availableUsers = (users.data || []).filter(
    (u) => modalMode === "edit" || !studentUserIds.has(u.id)
  );

  function openCreate() {
    setFormErrors([]);
    setFormData({
      user: availableUsers[0]?.id || "",
      admission_number: `FBS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date_of_birth: "",
      gender: "male",
      phone: "",
      address: "",
      guardian_name: "",
      guardian_phone: "",
      guardian_email: "",
      date_admitted: new Date().toISOString().split("T")[0],
    });
    setModalMode("create");
  }

  function openEdit(student) {
    setFormErrors([]);
    setCurrentStudent(student);
    setFormData({
      user: student.user,
      admission_number: student.admission_number || "",
      date_of_birth: student.date_of_birth || "",
      gender: student.gender || "male",
      phone: student.phone || "",
      address: student.address || "",
      guardian_name: student.guardian_name || "",
      guardian_phone: student.guardian_phone || "",
      guardian_email: student.guardian_email || "",
      date_admitted: student.date_admitted || "",
    });
    setModalMode("edit");
  }

  function openView(student) {
    setCurrentStudent(student);
    setModalMode("view");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormErrors([]);
    try {
      if (modalMode === "create") {
        await api("/api/students/", { method: "POST", body: formData });
        setStatusMessage("Student profile created successfully.");
      } else if (modalMode === "edit") {
        await api(`/api/students/${currentStudent.id}/`, { method: "PATCH", body: formData });
        setStatusMessage("Student profile updated successfully.");
      }
      setModalMode(null);
      students.reload();
      setTimeout(() => setStatusMessage(""), 4000);
    } catch (err) {
      setFormErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(student) {
    const name = student.user_info ? `${student.user_info.first_name} ${student.user_info.last_name}` : student.admission_number;
    if (!window.confirm(`Are you sure you want to delete student profile for ${name}?`)) return;
    try {
      await api(`/api/students/${student.id}/`, { method: "DELETE" });
      setStatusMessage("Student profile deleted.");
      students.reload();
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
          <h2 className="h4 fw-bold mb-1">Student Records</h2>
          <p className="text-muted small mb-0">Manage student profiles, admission numbers, and guardian details.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          + Add Student Record
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
                placeholder="Search students by name or admission number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4 text-md-end">
              <span className="badge bg-secondary-subtle text-secondary-emphasis">
                {studentList.length} {studentList.length === 1 ? "student record" : "student records"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Gender</th>
                <th>Guardian Contact</th>
                <th>Date Admitted</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.loading && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" /> Loading student records…
                  </td>
                </tr>
              )}
              {students.error && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-danger">
                    {students.error.message}
                  </td>
                </tr>
              )}
              {!students.loading && studentList.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No student records found. Click "+ Add Student Record" to create one.
                  </td>
                </tr>
              )}
              {studentList.map((s) => {
                const name = s.user_info
                  ? [s.user_info.first_name, s.user_info.last_name].filter(Boolean).join(" ") || s.user_info.username
                  : `User #${s.user}`;
                return (
                  <tr key={s.id}>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-semibold">
                        {s.admission_number}
                      </span>
                    </td>
                    <td className="fw-semibold">{name}</td>
                    <td className="text-capitalize">{s.gender || "—"}</td>
                    <td>
                      {s.guardian_name ? (
                        <div>
                          <div className="small fw-semibold">{s.guardian_name}</div>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {s.guardian_phone || s.guardian_email || "No phone"}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-muted small">{s.date_admitted || "—"}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-info" onClick={() => openView(s)}>
                          View
                        </button>
                        <button className="btn btn-outline-secondary" onClick={() => openEdit(s)}>
                          Edit
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => handleDelete(s)}>
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
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    {modalMode === "create" ? "Add Student Record" : "Edit Student Record"}
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

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Associated User Account *</label>
                      <select
                        className="form-select form-select-sm"
                        required
                        disabled={modalMode === "edit"}
                        value={formData.user}
                        onChange={(e) => setFormData({ ...formData, user: Number(e.target.value) })}
                      >
                        <option value="">-- Select User Account --</option>
                        {availableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.username} ({u.first_name} {u.last_name || ""})
                          </option>
                        ))}
                      </select>
                      <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                        Only users registered with role "student" are listed.
                      </small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Admission Number *</label>
                      <input
                        className="form-control form-control-sm"
                        required
                        value={formData.admission_number}
                        onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Gender</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Date Admitted</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={formData.date_admitted}
                        onChange={(e) => setFormData({ ...formData, date_admitted: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Student Phone</label>
                      <input
                        className="form-control form-control-sm"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Address</label>
                      <input
                        className="form-control form-control-sm"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <hr className="my-2" />
                      <h6 className="fw-bold small text-primary mb-2">Guardian / Parent Information</h6>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Guardian Name</label>
                      <input
                        className="form-control form-control-sm"
                        value={formData.guardian_name}
                        onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Guardian Phone</label>
                      <input
                        className="form-control form-control-sm"
                        value={formData.guardian_phone}
                        onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Guardian Email</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={formData.guardian_email}
                        onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                      />
                    </div>
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

      {/* View Detail Modal */}
      {modalMode === "view" && currentStudent && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Student Record Details</h5>
                <button type="button" className="btn-close" onClick={() => setModalMode(null)} />
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 50, height: 50, fontSize: "1.25rem" }}>
                    {currentStudent.user_info?.first_name?.[0] || "S"}
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">
                      {currentStudent.user_info?.first_name} {currentStudent.user_info?.last_name}
                    </h5>
                    <span className="badge bg-primary-subtle text-primary">
                      {currentStudent.admission_number}
                    </span>
                  </div>
                </div>

                <div className="row g-2 small">
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Username</span>
                    <span className="fw-semibold">{currentStudent.user_info?.username || "—"}</span>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Email</span>
                    <span className="fw-semibold">{currentStudent.user_info?.email || "—"}</span>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Gender</span>
                    <span className="fw-semibold text-capitalize">{currentStudent.gender || "—"}</span>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Date of Birth</span>
                    <span className="fw-semibold">{currentStudent.date_of_birth || "—"}</span>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Phone</span>
                    <span className="fw-semibold">{currentStudent.phone || "—"}</span>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Date Admitted</span>
                    <span className="fw-semibold">{currentStudent.date_admitted || "—"}</span>
                  </div>
                  <div className="col-12">
                    <span className="text-muted d-block">Address</span>
                    <span className="fw-semibold">{currentStudent.address || "—"}</span>
                  </div>
                  <div className="col-12"><hr className="my-2" /></div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block">Guardian Name</span>
                    <span className="fw-semibold">{currentStudent.guardian_name || "—"}</span>
                  </div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block">Guardian Phone</span>
                    <span className="fw-semibold">{currentStudent.guardian_phone || "—"}</span>
                  </div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block">Guardian Email</span>
                    <span className="fw-semibold">{currentStudent.guardian_email || "—"}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalMode(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
