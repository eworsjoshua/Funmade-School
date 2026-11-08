import { useState } from "react";
import { api, errorMessages } from "../../api/client";
import { useApi } from "../../lib/useApi";

export default function AcademicsSection() {
  const [subTab, setSubTab] = useState("classes"); // 'classes' | 'subjects' | 'assignments' | 'enroll' | 'sessions'

  const sessions = useApi("/api/academics/sessions/");
  const classes = useApi("/api/academics/classes/");
  const subjects = useApi("/api/academics/subjects/");
  const assignments = useApi("/api/academics/teaching-assignments/");
  const teachers = useApi("/api/teachers/");
  const students = useApi("/api/students/");

  // Selected session for enrollments & assignments
  const currentSession = sessions.data?.find((s) => s.is_current) || sessions.data?.[0];
  const [activeSessionId, setActiveSessionId] = useState(null);
  const selectedSessionId = activeSessionId || currentSession?.id;

  // New Class State
  const [newClassName, setNewClassName] = useState("");
  // New Subject State
  const [newSubject, setNewSubject] = useState({ name: "", code: "" });
  // New Session State
  const [newSession, setNewSession] = useState({ name: "", start_date: "", end_date: "", is_current: false });
  // New Teaching Assignment State
  const [newAssignment, setNewAssignment] = useState({
    teacher: "",
    subject: "",
    school_class: "",
    session: "",
  });
  // Bulk Enroll State
  const [enrollClassId, setEnrollClassId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [enrollResult, setEnrollResult] = useState(null);

  // Class Roster Modal State
  const [viewRosterClass, setViewRosterClass] = useState(null);
  const [rosterData, setRosterData] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errors, setErrors] = useState([]);

  function notify(msg) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  }

  // --- Handlers ---
  async function handleCreateClass(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await api("/api/academics/classes/", { method: "POST", body: { name: newClassName.trim() } });
      setNewClassName("");
      notify("Class created successfully.");
      classes.reload();
    } catch (err) {
      setErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteClass(id, name) {
    if (!window.confirm(`Delete class "${name}"?`)) return;
    try {
      await api(`/api/academics/classes/${id}/`, { method: "DELETE" });
      notify("Class deleted.");
      classes.reload();
    } catch (err) {
      alert(errorMessages(err).join("\n"));
    }
  }

  async function handleCreateSubject(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await api("/api/academics/subjects/", { method: "POST", body: newSubject });
      setNewSubject({ name: "", code: "" });
      notify("Subject created successfully.");
      subjects.reload();
    } catch (err) {
      setErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSubject(id, name) {
    if (!window.confirm(`Delete subject "${name}"?`)) return;
    try {
      await api(`/api/academics/subjects/${id}/`, { method: "DELETE" });
      notify("Subject deleted.");
      subjects.reload();
    } catch (err) {
      alert(errorMessages(err).join("\n"));
    }
  }

  async function handleCreateSession(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await api("/api/academics/sessions/", { method: "POST", body: newSession });
      setNewSession({ name: "", start_date: "", end_date: "", is_current: false });
      notify("Academic session created.");
      sessions.reload();
    } catch (err) {
      setErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateAssignment(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await api("/api/academics/teaching-assignments/", {
        method: "POST",
        body: {
          teacher: Number(newAssignment.teacher),
          subject: Number(newAssignment.subject),
          school_class: Number(newAssignment.school_class),
          session: Number(newAssignment.session || selectedSessionId),
        },
      });
      setNewAssignment({ teacher: "", subject: "", school_class: "", session: "" });
      notify("Teacher assignment created.");
      assignments.reload();
    } catch (err) {
      setErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAssignment(id) {
    if (!window.confirm("Remove this teaching assignment?")) return;
    try {
      await api(`/api/academics/teaching-assignments/${id}/`, { method: "DELETE" });
      notify("Teaching assignment removed.");
      assignments.reload();
    } catch (err) {
      alert(errorMessages(err).join("\n"));
    }
  }

  async function handleBulkEnroll(e) {
    e.preventDefault();
    if (!enrollClassId) {
      alert("Please select a target class.");
      return;
    }
    if (selectedStudentIds.length === 0) {
      alert("Please select at least one student.");
      return;
    }
    setSaving(true);
    setErrors([]);
    setEnrollResult(null);
    try {
      const res = await api(`/api/academics/classes/${enrollClassId}/enroll/`, {
        method: "POST",
        body: {
          session: selectedSessionId,
          students: selectedStudentIds,
        },
      });
      setEnrollResult(res);
      notify(`Enrolled ${res.enrolled?.length || 0} students.`);
      setSelectedStudentIds([]);
    } catch (err) {
      setErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function openClassRoster(schoolClass) {
    setViewRosterClass(schoolClass);
    setRosterLoading(true);
    try {
      const data = await api(
        `/api/academics/classes/${schoolClass.id}/students/${selectedSessionId ? `?session=${selectedSessionId}` : ""}`
      );
      setRosterData(data || []);
    } catch (err) {
      alert(errorMessages(err).join("\n"));
    } finally {
      setRosterLoading(false);
    }
  }

  const studentList = students.data?.results || (Array.isArray(students.data) ? students.data : []);
  const teacherList = teachers.data?.results || (Array.isArray(teachers.data) ? teachers.data : []);

  return (
    <div className="space-y-4">
      {statusMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {statusMessage}
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h2 className="h4 fw-bold mb-1">Academics & Enrollment</h2>
          <p className="text-muted small mb-0">Manage classes, subjects, teacher assignments, sessions, and student enrollment.</p>
        </div>
        {/* Session Selector */}
        <div className="d-flex align-items-center gap-2">
          <label className="small fw-semibold text-muted text-nowrap mb-0">Session:</label>
          <select
            className="form-select form-select-sm"
            value={selectedSessionId || ""}
            onChange={(e) => setActiveSessionId(Number(e.target.value))}
          >
            {sessions.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.is_current ? "(Current)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subtabs */}
      <div className="nav nav-pills gap-2 border-bottom pb-2">
        <button
          className={`btn btn-sm ${subTab === "classes" ? "btn-primary" : "btn-light"}`}
          onClick={() => { setErrors([]); setSubTab("classes"); }}
        >
          Classes
        </button>
        <button
          className={`btn btn-sm ${subTab === "subjects" ? "btn-primary" : "btn-light"}`}
          onClick={() => { setErrors([]); setSubTab("subjects"); }}
        >
          Subjects
        </button>
        <button
          className={`btn btn-sm ${subTab === "assignments" ? "btn-primary" : "btn-light"}`}
          onClick={() => { setErrors([]); setSubTab("assignments"); }}
        >
          Teaching Assignments
        </button>
        <button
          className={`btn btn-sm ${subTab === "enroll" ? "btn-primary" : "btn-light"}`}
          onClick={() => { setErrors([]); setSubTab("enroll"); }}
        >
          Bulk Enrollment
        </button>
        <button
          className={`btn btn-sm ${subTab === "sessions" ? "btn-primary" : "btn-light"}`}
          onClick={() => { setErrors([]); setSubTab("sessions"); }}
        >
          Sessions
        </button>
      </div>

      {errors.length > 0 && (
        <div className="alert alert-danger py-2 small">
          <ul className="mb-0 ps-3">
            {errors.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* --- SUBTAB 1: CLASSES --- */}
      {subTab === "classes" && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold py-3">Create New Class</div>
              <div className="card-body">
                <form onSubmit={handleCreateClass}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Class Name *</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="e.g. JSS1, JSS2, SS1 Gold"
                      required
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm w-100" disabled={saving}>
                    {saving ? "Creating…" : "+ Add Class"}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold py-3">Existing Classes</div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Class Name</th>
                      <th className="text-end">Roster & Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.loading && (
                      <tr><td colSpan="2" className="text-center py-4 text-muted">Loading classes…</td></tr>
                    )}
                    {!classes.loading && classes.data?.length === 0 && (
                      <tr><td colSpan="2" className="text-center py-4 text-muted">No classes created yet.</td></tr>
                    )}
                    {classes.data?.map((c) => (
                      <tr key={c.id}>
                        <td className="fw-semibold">{c.name}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openClassRoster(c)}
                          >
                            View Roster
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteClass(c.id, c.name)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: SUBJECTS --- */}
      {subTab === "subjects" && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold py-3">Create Subject</div>
              <div className="card-body">
                <form onSubmit={handleCreateSubject}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Subject Name *</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="e.g. Mathematics, English"
                      required
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Subject Code</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="e.g. MTH, ENG"
                      value={newSubject.code}
                      onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm w-100" disabled={saving}>
                    {saving ? "Creating…" : "+ Add Subject"}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold py-3">Existing Subjects</div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Subject Name</th>
                      <th>Code</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.loading && (
                      <tr><td colSpan="3" className="text-center py-4 text-muted">Loading subjects…</td></tr>
                    )}
                    {!subjects.loading && subjects.data?.length === 0 && (
                      <tr><td colSpan="3" className="text-center py-4 text-muted">No subjects added yet.</td></tr>
                    )}
                    {subjects.data?.map((s) => (
                      <tr key={s.id}>
                        <td className="fw-semibold">{s.name}</td>
                        <td><span className="badge bg-light text-dark border">{s.code || "—"}</span></td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteSubject(s.id, s.name)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: TEACHING ASSIGNMENTS --- */}
      {subTab === "assignments" && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold py-3">Assign Teacher to Subject & Class</div>
              <div className="card-body">
                <form onSubmit={handleCreateAssignment}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Teacher *</label>
                    <select
                      className="form-select form-select-sm"
                      required
                      value={newAssignment.teacher}
                      onChange={(e) => setNewAssignment({ ...newAssignment, teacher: e.target.value })}
                    >
                      <option value="">-- Select Teacher --</option>
                      {teacherList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.user_info ? `${t.user_info.first_name} ${t.user_info.last_name}` : `Teacher #${t.id}`} ({t.staff_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Subject *</label>
                    <select
                      className="form-select form-select-sm"
                      required
                      value={newAssignment.subject}
                      onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                    >
                      <option value="">-- Select Subject --</option>
                      {subjects.data?.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Class *</label>
                    <select
                      className="form-select form-select-sm"
                      required
                      value={newAssignment.school_class}
                      onChange={(e) => setNewAssignment({ ...newAssignment, school_class: e.target.value })}
                    >
                      <option value="">-- Select Class --</option>
                      {classes.data?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm w-100" disabled={saving}>
                    {saving ? "Saving…" : "Assign Teacher"}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold py-3">Active Teaching Assignments</div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Class</th>
                      <th>Subject</th>
                      <th>Teacher</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.loading && (
                      <tr><td colSpan="4" className="text-center py-4 text-muted">Loading assignments…</td></tr>
                    )}
                    {!assignments.loading && assignments.data?.length === 0 && (
                      <tr><td colSpan="4" className="text-center py-4 text-muted">No assignments yet.</td></tr>
                    )}
                    {assignments.data?.map((a) => (
                      <tr key={a.id}>
                        <td className="fw-semibold">{a.class_name}</td>
                        <td>{a.subject_name}</td>
                        <td>{a.teacher_name}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteAssignment(a.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 4: BULK ENROLLMENT --- */}
      {subTab === "enroll" && (
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Bulk Enroll Students into Class</h5>
            <form onSubmit={handleBulkEnroll}>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Target Class *</label>
                  <select
                    className="form-select form-select-sm"
                    required
                    value={enrollClassId}
                    onChange={(e) => setEnrollClassId(e.target.value)}
                  >
                    <option value="">-- Select Class to Enroll Into --</option>
                    {classes.data?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Academic Session</label>
                  <input
                    className="form-control form-control-sm"
                    disabled
                    value={currentSession?.name || "Active Session"}
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label small fw-semibold mb-0">Select Students ({selectedStudentIds.length} selected):</label>
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setSelectedStudentIds(studentList.map((s) => s.id))}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setSelectedStudentIds([])}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="border rounded p-3" style={{ maxHeight: 300, overflowY: "auto" }}>
                  <div className="row g-2">
                    {studentList.map((s) => {
                      const name = s.user_info
                        ? `${s.user_info.first_name} ${s.user_info.last_name}`
                        : `Student #${s.id}`;
                      const checked = selectedStudentIds.includes(s.id);
                      return (
                        <div className="col-md-6 col-lg-4" key={s.id}>
                          <label className="form-check d-flex align-items-center gap-2 p-2 border rounded hover-bg-light cursor-pointer mb-0">
                            <input
                              type="checkbox"
                              className="form-check-input mt-0"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, s.id]);
                                else setSelectedStudentIds(selectedStudentIds.filter((id) => id !== s.id));
                              }}
                            />
                            <div className="small">
                              <span className="fw-semibold d-block text-truncate">{name}</span>
                              <span className="text-muted" style={{ fontSize: "0.75rem" }}>{s.admission_number}</span>
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm" disabled={saving || selectedStudentIds.length === 0}>
                {saving ? "Enrolling…" : `Enroll ${selectedStudentIds.length} Students`}
              </button>
            </form>

            {enrollResult && (
              <div className="mt-4 p-3 bg-light rounded border">
                <h6 className="fw-bold text-success mb-2">Enrollment Completed:</h6>
                <p className="small mb-1">
                  Enrolled <strong>{enrollResult.enrolled?.length}</strong> students into <strong>{enrollResult.class}</strong> for {enrollResult.session}.
                </p>
                {enrollResult.skipped?.length > 0 && (
                  <div className="mt-2 text-warning-emphasis small">
                    <strong>Skipped ({enrollResult.skipped.length}):</strong>
                    <ul className="mb-0 ps-3">
                      {enrollResult.skipped.map((sk, i) => (
                        <li key={i}>{sk.reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SUBTAB 5: SESSIONS --- */}
      {subTab === "sessions" && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold py-3">Create Academic Session</div>
              <div className="card-body">
                <form onSubmit={handleCreateSession}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Session Name *</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="e.g. 2026/2027"
                      required
                      value={newSession.name}
                      onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Start Date *</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      required
                      value={newSession.start_date}
                      onChange={(e) => setNewSession({ ...newSession, start_date: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">End Date *</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      required
                      value={newSession.end_date}
                      onChange={(e) => setNewSession({ ...newSession, end_date: e.target.value })}
                    />
                  </div>
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isCurrent"
                      checked={newSession.is_current}
                      onChange={(e) => setNewSession({ ...newSession, is_current: e.target.checked })}
                    />
                    <label className="form-check-label small" htmlFor="isCurrent">
                      Set as current active session
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm w-100" disabled={saving}>
                    {saving ? "Creating…" : "+ Add Session"}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold py-3">Academic Sessions</div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Session Name</th>
                      <th>Dates</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.loading && (
                      <tr><td colSpan="3" className="text-center py-4 text-muted">Loading sessions…</td></tr>
                    )}
                    {sessions.data?.map((s) => (
                      <tr key={s.id}>
                        <td className="fw-semibold">{s.name}</td>
                        <td className="small text-muted">{s.start_date} to {s.end_date}</td>
                        <td>
                          {s.is_current ? (
                            <span className="badge bg-success">Current Session</span>
                          ) : (
                            <span className="badge bg-light text-dark border">Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Roster Modal */}
      {viewRosterClass && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Class Roster: {viewRosterClass.name} ({currentSession?.name})
                </h5>
                <button type="button" className="btn-close" onClick={() => setViewRosterClass(null)} />
              </div>
              <div className="modal-body">
                {rosterLoading ? (
                  <div className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" /> Loading enrolled students…
                  </div>
                ) : rosterData.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    No students currently enrolled in this class for this session.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Admission No</th>
                          <th>Student Name</th>
                          <th>Enrolled Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rosterData.map((e) => (
                          <tr key={e.id}>
                            <td>
                              <span className="badge bg-primary-subtle text-primary">
                                {e.admission_number || e.student?.admission_number}
                              </span>
                            </td>
                            <td className="fw-semibold">{e.student_name}</td>
                            <td className="small text-muted">{e.created_at?.split("T")[0] || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewRosterClass(null)}>
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
