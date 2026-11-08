import { useAuth } from "../../auth/AuthContext";
import { useApi } from "../../lib/useApi";

export default function StudentProfileTab() {
  const { user } = useAuth();
  const profile = useApi("/api/students/me/");
  const enrollment = useApi("/api/academics/my-enrollment/");

  const p = profile.data;
  const e = enrollment.data;

  return (
    <div className="space-y-4">
      {/* Profile Overview Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap align-items-center gap-4">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-2"
              style={{ width: 80, height: 80 }}
            >
              {user?.first_name?.[0] || "S"}
            </div>
            <div>
              <h4 className="fw-bold mb-1">
                {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username}
              </h4>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="badge bg-primary fs-6">
                  {p?.admission_number || "Student"}
                </span>
                <span className="badge bg-light text-dark border">
                  Class: {e?.class || "Not enrolled"}
                </span>
                <span className="badge bg-light text-secondary border">
                  {e?.session || "Active Session"}
                </span>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          {/* Student Details Grid */}
          <div className="row g-3">
            <div className="col-sm-6 col-md-4">
              <span className="text-muted small d-block">Username</span>
              <span className="fw-semibold">{user?.username}</span>
            </div>
            <div className="col-sm-6 col-md-4">
              <span className="text-muted small d-block">Email</span>
              <span className="fw-semibold">{user?.email || "—"}</span>
            </div>
            <div className="col-sm-6 col-md-4">
              <span className="text-muted small d-block">Gender</span>
              <span className="fw-semibold text-capitalize">{p?.gender || "—"}</span>
            </div>
            <div className="col-sm-6 col-md-4">
              <span className="text-muted small d-block">Date of Birth</span>
              <span className="fw-semibold">{p?.date_of_birth || "—"}</span>
            </div>
            <div className="col-sm-6 col-md-4">
              <span className="text-muted small d-block">Phone</span>
              <span className="fw-semibold">{p?.phone || "—"}</span>
            </div>
            <div className="col-sm-6 col-md-4">
              <span className="text-muted small d-block">Date Admitted</span>
              <span className="fw-semibold">{p?.date_admitted || "—"}</span>
            </div>
            <div className="col-12">
              <span className="text-muted small d-block">Home Address</span>
              <span className="fw-semibold">{p?.address || "—"}</span>
            </div>
          </div>

          {/* Guardian Info */}
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="fw-bold text-primary mb-3">Guardian Information</h6>
            <div className="row g-2">
              <div className="col-sm-4">
                <span className="text-muted small d-block">Guardian Name</span>
                <span className="fw-semibold">{p?.guardian_name || "—"}</span>
              </div>
              <div className="col-sm-4">
                <span className="text-muted small d-block">Guardian Phone</span>
                <span className="fw-semibold">{p?.guardian_phone || "—"}</span>
              </div>
              <div className="col-sm-4">
                <span className="text-muted small d-block">Guardian Email</span>
                <span className="fw-semibold">{p?.guardian_email || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Subjects & Teachers */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="fw-bold mb-0">Enrolled Subjects & Teachers</h5>
          <p className="text-muted small mb-0">List of subjects and instructors assigned to your class.</p>
        </div>
        <div className="card-body p-0">
          {enrollment.loading && (
            <div className="text-center py-4 text-muted">Loading subjects…</div>
          )}
          {!enrollment.loading && (!e?.subjects || e.subjects.length === 0) && (
            <div className="text-center py-4 text-muted">
              No subjects have been assigned to your class yet.
            </div>
          )}
          {e?.subjects && e.subjects.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Subject</th>
                    <th>Subject Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {e.subjects.map((sub, idx) => (
                    <tr key={idx}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td className="fw-semibold">{sub.subject}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {sub.teacher || "Assigned Teacher"}
                        </span>
                      </td>
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
