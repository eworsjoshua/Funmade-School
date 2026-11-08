import { useApi } from "../../lib/useApi";

export default function StudentAttendanceTab() {
  const summary = useApi("/api/attendance/my/summary/");
  const history = useApi("/api/attendance/my/");

  const sum = summary.data;
  const records = history.data?.results || (Array.isArray(history.data) ? history.data : []);

  const percentage = sum?.attendance_percentage != null ? `${sum.attendance_percentage}%` : "—";

  return (
    <div className="space-y-4">
      {/* Attendance Stats Cards */}
      <div className="row g-3">
        <div className="col-sm-6 col-md-3">
          <div className="card shadow-sm border-0 h-100 p-3 text-center">
            <span className="text-muted small d-block">Overall Attendance</span>
            <h2 className="fw-bold text-primary mb-1">{percentage}</h2>
            <div className="progress mt-2" style={{ height: 6 }}>
              <div
                className={`progress-bar ${
                  (sum?.attendance_percentage ?? 0) >= 75
                    ? "bg-success"
                    : (sum?.attendance_percentage ?? 0) >= 50
                    ? "bg-warning"
                    : "bg-danger"
                }`}
                style={{ width: `${sum?.attendance_percentage ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-3">
          <div className="card shadow-sm border-0 h-100 p-3 text-center">
            <span className="text-muted small d-block">Days Present</span>
            <h2 className="fw-bold text-success mb-1">{sum?.present ?? 0}</h2>
            <span className="text-muted small">Classes attended</span>
          </div>
        </div>

        <div className="col-sm-6 col-md-3">
          <div className="card shadow-sm border-0 h-100 p-3 text-center">
            <span className="text-muted small d-block">Days Late</span>
            <h2 className="fw-bold text-warning mb-1">{sum?.late ?? 0}</h2>
            <span className="text-muted small">Late arrivals</span>
          </div>
        </div>

        <div className="col-sm-6 col-md-3">
          <div className="card shadow-sm border-0 h-100 p-3 text-center">
            <span className="text-muted small d-block">Days Absent</span>
            <h2 className="fw-bold text-danger mb-1">{sum?.absent ?? 0}</h2>
            <span className="text-muted small">Missed days</span>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="fw-bold mb-0">Daily Attendance Log</h5>
          <p className="text-muted small mb-0">Detailed record of your attendance status per date.</p>
        </div>
        <div className="card-body p-0">
          {history.loading && (
            <div className="text-center py-5 text-muted">Loading attendance history…</div>
          )}
          {!history.loading && records.length === 0 && (
            <div className="text-center py-5 text-muted">
              No attendance records logged for your account yet.
            </div>
          )}
          {records.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Class</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-semibold">{r.date}</td>
                      <td>{r.class_name}</td>
                      <td>
                        <span
                          className={`badge ${
                            r.status === "present"
                              ? "bg-success"
                              : r.status === "late"
                              ? "bg-warning text-dark"
                              : "bg-danger"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="text-muted small">{r.remarks || "—"}</td>
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
