import { useState } from "react";
import { api, errorMessages } from "../../api/client";
import { useApi } from "../../lib/useApi";

export default function TeacherClassesTab() {
  const classes = useApi("/api/academics/my-classes/");
  const [selectedClass, setSelectedClass] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  async function openClassRoster(item) {
    setSelectedClass(item);
    setLoadingRoster(true);
    try {
      const data = await api(`/api/academics/classes/${item.school_class}/students/`);
      setRoster(data || []);
    } catch (err) {
      alert(errorMessages(err).join("\n"));
    } finally {
      setLoadingRoster(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="fw-bold mb-0">My Teaching Assignments</h5>
          <p className="text-muted small mb-0">Classes and subjects assigned to you for the active session.</p>
        </div>
        <div className="card-body p-0">
          {classes.loading && (
            <div className="text-center py-5 text-muted">
              <span className="spinner-border spinner-border-sm me-2" /> Loading your assigned classes…
            </div>
          )}
          {!classes.loading && classes.data?.length === 0 && (
            <div className="text-center py-5 text-muted">
              You have not been assigned to any classes or subjects yet. Contact the school administrator.
            </div>
          )}
          {!classes.loading && classes.data?.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Academic Session</th>
                    <th className="text-end">Roster</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.data.map((a) => (
                    <tr key={a.id}>
                      <td className="fw-semibold">{a.class_name}</td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary fs-6">
                          {a.subject_name}
                        </span>
                      </td>
                      <td className="text-muted small">{a.session_name}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openClassRoster(a)}
                        >
                          View Enrolled Students
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Roster Modal */}
      {selectedClass && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Class Roster: {selectedClass.class_name} — {selectedClass.subject_name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedClass(null)} />
              </div>
              <div className="modal-body">
                {loadingRoster ? (
                  <div className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" /> Loading enrolled students…
                  </div>
                ) : roster.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    No students currently enrolled in this class.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Admission No</th>
                          <th>Student Name</th>
                          <th>Guardian Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roster.map((e) => (
                          <tr key={e.id}>
                            <td>
                              <span className="badge bg-primary-subtle text-primary">
                                {e.admission_number || e.student?.admission_number}
                              </span>
                            </td>
                            <td className="fw-semibold">{e.student_name}</td>
                            <td className="small text-muted">
                              {e.student?.guardian_phone || e.student?.phone || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedClass(null)}>
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
