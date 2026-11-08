import { useState } from "react";
import { api, errorMessages } from "../../api/client";
import { useApi } from "../../lib/useApi";

export default function ExamsSection() {
  const [subTab, setSubTab] = useState("exams"); // 'exams' | 'scoresheet' | 'results'

  const exams = useApi("/api/exams/exams/");
  const classes = useApi("/api/academics/classes/");
  const subjects = useApi("/api/academics/subjects/");
  const sessions = useApi("/api/academics/sessions/");

  // Create Exam Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExam, setNewExam] = useState({
    name: "",
    assessment_type: "exam",
    school_class: "",
    subject: "",
    session: "",
    term: "first",
    max_marks: 100,
    date: new Date().toISOString().split("T")[0],
    is_published: false,
  });

  // Score Sheet State
  const [activeExam, setActiveExam] = useState(null);
  const [sheetData, setSheetData] = useState([]);
  const [loadingSheet, setLoadingSheet] = useState(false);

  // Class Results State
  const [resultClassId, setResultClassId] = useState("");
  const [resultTerm, setResultTerm] = useState("first");
  const [resultData, setResultData] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  const currentSession = sessions.data?.find((s) => s.is_current) || sessions.data?.[0];

  function notify(msg) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  }

  // Set default values for modal
  function openAddExam() {
    setErrors([]);
    setNewExam({
      name: "First Term Exam",
      assessment_type: "exam",
      school_class: classes.data?.[0]?.id || "",
      subject: subjects.data?.[0]?.id || "",
      session: currentSession?.id || "",
      term: "first",
      max_marks: 100,
      date: new Date().toISOString().split("T")[0],
      is_published: false,
    });
    setShowAddModal(true);
  }

  async function handleCreateExam(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await api("/api/exams/exams/", {
        method: "POST",
        body: {
          ...newExam,
          school_class: Number(newExam.school_class),
          subject: Number(newExam.subject),
          session: Number(newExam.session || currentSession?.id),
          max_marks: Number(newExam.max_marks),
        },
      });
      setShowAddModal(false);
      notify("Assessment created successfully.");
      exams.reload();
    } catch (err) {
      setErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(exam) {
    try {
      await api(`/api/exams/exams/${exam.id}/`, {
        method: "PATCH",
        body: { is_published: !exam.is_published },
      });
      notify(exam.is_published ? "Results unpublished." : "Results published to students.");
      exams.reload();
    } catch (err) {
      alert(errorMessages(err).join("\n"));
    }
  }

  async function handleDeleteExam(exam) {
    if (!window.confirm(`Delete exam "${exam.name}"?`)) return;
    try {
      await api(`/api/exams/exams/${exam.id}/`, { method: "DELETE" });
      notify("Exam deleted.");
      exams.reload();
    } catch (err) {
      alert(errorMessages(err).join("\n"));
    }
  }

  async function openScoreSheet(exam) {
    setActiveExam(exam);
    setSubTab("scoresheet");
    setLoadingSheet(true);
    setErrors([]);
    try {
      const data = await api(`/api/exams/exams/${exam.id}/sheet/`);
      setSheetData(
        (data.students || []).map((s) => ({
          student: s.student_id || s.student,
          name: s.name,
          admission_number: s.admission_number,
          score: s.score == null ? "" : s.score,
          remarks: s.remarks || "",
        }))
      );
    } catch (err) {
      setErrors(errorMessages(err));
      setSheetData([]);
    } finally {
      setLoadingSheet(false);
    }
  }

  function updateStudentScore(studentId, val) {
    setSheetData((prev) =>
      prev.map((s) => (s.student === studentId ? { ...s, score: val } : s))
    );
  }

  function updateStudentRemarks(studentId, val) {
    setSheetData((prev) =>
      prev.map((s) => (s.student === studentId ? { ...s, remarks: val } : s))
    );
  }

  async function handleSaveScores(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);

    // Validate scores against max_marks
    const invalid = sheetData.find(
      (s) => s.score !== "" && (Number(s.score) < 0 || Number(s.score) > activeExam.max_marks)
    );
    if (invalid) {
      setErrors([
        `Score for ${invalid.name} must be between 0 and maximum marks (${activeExam.max_marks}).`,
      ]);
      setSaving(false);
      return;
    }

    try {
      // Filter only rows that have an entered score
      const toSend = sheetData
        .filter((s) => s.score !== "")
        .map((s) => ({
          student: s.student,
          score: Number(s.score),
          remarks: s.remarks,
        }));

      await api(`/api/exams/exams/${activeExam.id}/record-scores/`, {
        method: "POST",
        body: { scores: toSend },
      });
      notify("Scores recorded successfully.");
      openScoreSheet(activeExam);
    } catch (err) {
      setErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function loadClassResults() {
    if (!resultClassId) return;
    setLoadingResults(true);
    setErrors([]);
    try {
      const data = await api(
        `/api/exams/results/class/?school_class=${resultClassId}&term=${resultTerm}${
          currentSession ? `&session=${currentSession.id}` : ""
        }`
      );
      setResultData(data);
    } catch (err) {
      setErrors(errorMessages(err));
      setResultData(null);
    } finally {
      setLoadingResults(false);
    }
  }

  const examList = exams.data?.results || (Array.isArray(exams.data) ? exams.data : []);

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
          <h2 className="h4 fw-bold mb-1">Exams & Grade Records</h2>
          <p className="text-muted small mb-0">Create assessments, record test & exam scores, and publish class result sheets.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAddExam}>
          + Create Assessment
        </button>
      </div>

      {/* Subtabs */}
      <div className="nav nav-pills gap-2 border-bottom pb-2">
        <button
          className={`btn btn-sm ${subTab === "exams" ? "btn-primary" : "btn-light"}`}
          onClick={() => { setErrors([]); setSubTab("exams"); }}
        >
          Assessments List
        </button>
        {activeExam && (
          <button
            className={`btn btn-sm ${subTab === "scoresheet" ? "btn-primary" : "btn-light"}`}
            onClick={() => setSubTab("scoresheet")}
          >
            Score Sheet: {activeExam.name} ({activeExam.class_name})
          </button>
        )}
        <button
          className={`btn btn-sm ${subTab === "results" ? "btn-primary" : "btn-light"}`}
          onClick={() => {
            setErrors([]);
            setSubTab("results");
            if (!resultClassId && classes.data?.length > 0) {
              setResultClassId(String(classes.data[0].id));
            }
          }}
        >
          Class Result Sheet
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

      {/* --- SUBTAB 1: ASSESSMENTS LIST --- */}
      {subTab === "exams" && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Assessment Name</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Term</th>
                  <th>Max Marks</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.loading && (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">Loading assessments…</td></tr>
                )}
                {!exams.loading && examList.length === 0 && (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No assessments created yet. Click "+ Create Assessment" above.</td></tr>
                )}
                {examList.map((exam) => (
                  <tr key={exam.id}>
                    <td className="fw-semibold">
                      {exam.name}
                      <span className="badge bg-light text-secondary border ms-2 text-uppercase" style={{ fontSize: "0.7rem" }}>
                        {exam.assessment_type}
                      </span>
                    </td>
                    <td>{exam.class_name}</td>
                    <td>{exam.subject_name}</td>
                    <td className="text-capitalize">{exam.term} Term</td>
                    <td>{exam.max_marks}</td>
                    <td className="small text-muted">{exam.date}</td>
                    <td>
                      <span className={`badge ${exam.is_published ? "bg-success" : "bg-warning text-dark"}`}>
                        {exam.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          title="Enter Scores"
                          onClick={() => openScoreSheet(exam)}
                        >
                          Scores
                        </button>
                        <button
                          className={`btn ${exam.is_published ? "btn-outline-warning" : "btn-outline-success"}`}
                          title={exam.is_published ? "Unpublish" : "Publish"}
                          onClick={() => togglePublish(exam)}
                        >
                          {exam.is_published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="Delete"
                          onClick={() => handleDeleteExam(exam)}
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
      )}

      {/* --- SUBTAB 2: SCORE SHEET --- */}
      {subTab === "scoresheet" && activeExam && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-0">Score Sheet: {activeExam.name}</h5>
              <div className="small text-muted">
                Class: <strong>{activeExam.class_name}</strong> | Subject: <strong>{activeExam.subject_name}</strong> | Max Marks: <strong>{activeExam.max_marks}</strong>
              </div>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setSubTab("exams")}>
              ← Back to List
            </button>
          </div>

          <div className="card-body p-0">
            {loadingSheet ? (
              <div className="text-center py-5 text-muted">
                <span className="spinner-border spinner-border-sm me-2" /> Loading student scores…
              </div>
            ) : sheetData.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No students enrolled in {activeExam.class_name}.
              </div>
            ) : (
              <form onSubmit={handleSaveScores}>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Admission No</th>
                        <th>Student Name</th>
                        <th style={{ width: 140 }}>Score (Max: {activeExam.max_marks})</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sheetData.map((row) => (
                        <tr key={row.student}>
                          <td>
                            <span className="badge bg-primary-subtle text-primary">
                              {row.admission_number}
                            </span>
                          </td>
                          <td className="fw-semibold">{row.name}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm text-center fw-bold"
                              min="0"
                              max={activeExam.max_marks}
                              step="0.5"
                              placeholder="—"
                              value={row.score}
                              onChange={(e) => updateStudentScore(row.student, e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              className="form-control form-control-sm"
                              placeholder="e.g. Excellent understanding"
                              value={row.remarks}
                              onChange={(e) => updateStudentRemarks(row.student, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center">
                  <div className="small text-muted">
                    Total Enrolled: <strong>{sheetData.length}</strong> | Recorded:{" "}
                    <strong>{sheetData.filter((s) => s.score !== "").length}</strong>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm px-4 fw-semibold" disabled={saving}>
                    {saving ? "Saving Scores…" : "Save All Scores"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: CLASS RESULT SHEET --- */}
      {subTab === "results" && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <div className="row g-2 align-items-center">
              <div className="col-md-5">
                <label className="form-label small fw-semibold mb-1">Select Class</label>
                <select
                  className="form-select form-select-sm"
                  value={resultClassId}
                  onChange={(e) => setResultClassId(e.target.value)}
                >
                  <option value="">-- Choose Class --</option>
                  {classes.data?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold mb-1">Select Term</label>
                <select
                  className="form-select form-select-sm"
                  value={resultTerm}
                  onChange={(e) => setResultTerm(e.target.value)}
                >
                  <option value="first">First Term</option>
                  <option value="second">Second Term</option>
                  <option value="third">Third Term</option>
                </select>
              </div>
              <div className="col-md-3 pt-3 text-md-end">
                <button
                  className="btn btn-primary btn-sm w-100"
                  onClick={loadClassResults}
                  disabled={loadingResults || !resultClassId}
                >
                  {loadingResults ? "Compiling…" : "View Class Results"}
                </button>
              </div>
            </div>
          </div>

          <div className="card-body">
            {loadingResults && (
              <div className="text-center py-5 text-muted">
                <span className="spinner-border spinner-border-sm me-2" /> Calculating totals, averages and positions…
              </div>
            )}

            {!loadingResults && resultData && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-0">
                      Class Result Sheet: {resultData.class} ({resultData.term?.toUpperCase()} TERM)
                    </h5>
                    <span className="small text-muted">{resultData.session}</span>
                  </div>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
                    Print Sheet
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle mb-0 text-center">
                    <thead className="table-light">
                      <tr>
                        <th className="text-start">Position</th>
                        <th className="text-start">Admission No</th>
                        <th className="text-start">Student Name</th>
                        {resultData.subjects?.map((sub) => (
                          <th key={sub.id || sub.name}>{sub.name}</th>
                        ))}
                        <th>Total</th>
                        <th>Average</th>
                        <th>Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultData.students?.map((s, idx) => (
                        <tr key={s.student_id || idx}>
                          <td className="text-start fw-bold">#{s.position || idx + 1}</td>
                          <td className="text-start">
                            <span className="badge bg-primary-subtle text-primary">
                              {s.admission_number}
                            </span>
                          </td>
                          <td className="text-start fw-semibold">{s.name}</td>
                          {resultData.subjects?.map((sub) => {
                            const subScore = s.subject_scores?.[sub.name] ?? s.scores?.[sub.name];
                            return <td key={sub.id || sub.name}>{subScore != null ? subScore : "—"}</td>;
                          })}
                          <td className="fw-bold text-primary">{s.total_score ?? s.total ?? "—"}</td>
                          <td className="fw-bold">{s.average ? `${Number(s.average).toFixed(1)}%` : "—"}</td>
                          <td>
                            <span className="badge bg-success-subtle text-success fw-bold">
                              {s.position ? `${s.position}${getOrdinal(s.position)}` : "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleCreateExam}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Create Assessment</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Assessment Title *</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="e.g. Mid-Term Test, Final Exam"
                      required
                      value={newExam.name}
                      onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={newExam.assessment_type}
                        onChange={(e) => setNewExam({ ...newExam, assessment_type: e.target.value })}
                      >
                        <option value="exam">Exam</option>
                        <option value="test">Test</option>
                        <option value="quiz">Quiz</option>
                        <option value="assignment">Assignment</option>
                      </select>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Term</label>
                      <select
                        className="form-select form-select-sm"
                        value={newExam.term}
                        onChange={(e) => setNewExam({ ...newExam, term: e.target.value })}
                      >
                        <option value="first">First Term</option>
                        <option value="second">Second Term</option>
                        <option value="third">Third Term</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Class *</label>
                      <select
                        className="form-select form-select-sm"
                        required
                        value={newExam.school_class}
                        onChange={(e) => setNewExam({ ...newExam, school_class: e.target.value })}
                      >
                        <option value="">-- Choose Class --</option>
                        {classes.data?.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Subject *</label>
                      <select
                        className="form-select form-select-sm"
                        required
                        value={newExam.subject}
                        onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                      >
                        <option value="">-- Choose Subject --</option>
                        {subjects.data?.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Max Marks *</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        required
                        min="1"
                        max="1000"
                        value={newExam.max_marks}
                        onChange={(e) => setNewExam({ ...newExam, max_marks: e.target.value })}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={newExam.date}
                        onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-check mt-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="publishNow"
                      checked={newExam.is_published}
                      onChange={(e) => setNewExam({ ...newExam, is_published: e.target.checked })}
                    />
                    <label className="form-check-label small" htmlFor="publishNow">
                      Publish immediately to students
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? "Creating…" : "Create Assessment"}
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

function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
