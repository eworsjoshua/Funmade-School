import { useState } from "react";
import { useApi } from "../../lib/useApi";

export default function StudentGradesTab() {
  const [term, setTerm] = useState("first");
  const result = useApi(term ? `/api/exams/results/my/?term=${term}` : null);
  const individualScores = useApi("/api/exams/scores/my/");

  const resultData = result.data;
  const loadingResult = result.loading;
  const errors = result.error ? [result.error.message] : [];
  const scoresList = individualScores.data?.results || (Array.isArray(individualScores.data) ? individualScores.data : []);

  return (
    <div className="space-y-4">
      {/* Term Selector Header */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-sm-6">
              <h5 className="fw-bold mb-0">Academic Performance & Report Card</h5>
              <p className="text-muted small mb-0">View your published terminal report card and test scores.</p>
            </div>
            <div className="col-sm-6 d-flex justify-content-sm-end align-items-center gap-2">
              <label className="small fw-semibold text-muted text-nowrap mb-0">Select Term:</label>
              <select
                className="form-select form-select-sm"
                style={{ maxWidth: 180 }}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              >
                <option value="first">First Term</option>
                <option value="second">Second Term</option>
                <option value="third">Third Term</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="alert alert-info py-3 small">
          <ul className="mb-0 ps-3">
            {errors.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Terminal Report Card */}
      {loadingResult && (
        <div className="text-center py-5 text-muted">
          <span className="spinner-border spinner-border-sm me-2" /> Loading terminal report card…
        </div>
      )}

      {!loadingResult && resultData && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-0">
                Terminal Report Card: {term.toUpperCase()} TERM
              </h5>
              <span className="small text-muted">
                Class: <strong>{resultData.class}</strong> | Session: <strong>{resultData.session}</strong>
              </span>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
              Print Report
            </button>
          </div>

          <div className="card-body p-4">
            {/* Summary Highlights */}
            <div className="row g-3 mb-4">
              <div className="col-sm-4">
                <div className="p-3 bg-light rounded text-center">
                  <span className="text-muted small d-block">Class Position</span>
                  <h3 className="fw-bold text-primary mb-0">
                    {resultData.position ? `${resultData.position}${getOrdinal(resultData.position)}` : "—"}
                  </h3>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="p-3 bg-light rounded text-center">
                  <span className="text-muted small d-block">Total Score</span>
                  <h3 className="fw-bold text-success mb-0">{resultData.total_score ?? "—"}</h3>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="p-3 bg-light rounded text-center">
                  <span className="text-muted small d-block">Overall Average</span>
                  <h3 className="fw-bold text-info mb-0">
                    {resultData.average ? `${Number(resultData.average).toFixed(1)}%` : "—"}
                  </h3>
                </div>
              </div>
            </div>

            {/* Subject Scores Table */}
            <h6 className="fw-bold mb-3">Subject Breakdown</h6>
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Subject</th>
                    <th className="text-center">Score</th>
                    <th className="text-center">Grade</th>
                    <th>Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(resultData.subjects || resultData.subject_scores || {}).map(
                    ([subjectName, val]) => {
                      const score = typeof val === "object" ? val.score : val;
                      const remarks = typeof val === "object" ? val.remarks : "";
                      const grade = getGrade(score);
                      return (
                        <tr key={subjectName}>
                          <td className="fw-semibold">{subjectName}</td>
                          <td className="text-center fw-bold">{score != null ? score : "—"}</td>
                          <td className="text-center">
                            <span
                              className={`badge ${
                                grade === "A"
                                  ? "bg-success"
                                  : grade === "B"
                                  ? "bg-primary"
                                  : grade === "C"
                                  ? "bg-info text-dark"
                                  : grade === "D"
                                  ? "bg-warning text-dark"
                                  : "bg-danger"
                              }`}
                            >
                              {grade}
                            </span>
                          </td>
                          <td className="text-muted small">{remarks || "Satisfactory"}</td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Individual Published Scores */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="fw-bold mb-0">Published Assessment Scores</h5>
          <p className="text-muted small mb-0">Individual continuous assessments and tests published by your teachers.</p>
        </div>
        <div className="card-body p-0">
          {individualScores.loading && (
            <div className="text-center py-4 text-muted">Loading scores…</div>
          )}
          {!individualScores.loading && scoresList.length === 0 && (
            <div className="text-center py-4 text-muted">
              No individual assessments published yet for your class.
            </div>
          )}
          {scoresList.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Assessment</th>
                    <th>Subject</th>
                    <th>Score / Max</th>
                    <th>Percentage</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {scoresList.map((sc) => {
                    const pct = sc.exam?.max_marks
                      ? ((sc.score / sc.exam.max_marks) * 100).toFixed(1)
                      : null;
                    return (
                      <tr key={sc.id}>
                        <td className="fw-semibold">{sc.exam?.name || `Exam #${sc.exam}`}</td>
                        <td>{sc.exam?.subject_name || "—"}</td>
                        <td>
                          <span className="fw-bold">{sc.score}</span> / {sc.exam?.max_marks || "100"}
                        </td>
                        <td>{pct ? `${pct}%` : "—"}</td>
                        <td className="text-muted small">{sc.remarks || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function getGrade(score) {
  if (score == null) return "—";
  const num = Number(score);
  if (num >= 75) return "A";
  if (num >= 65) return "B";
  if (num >= 50) return "C";
  if (num >= 40) return "D";
  return "F";
}
