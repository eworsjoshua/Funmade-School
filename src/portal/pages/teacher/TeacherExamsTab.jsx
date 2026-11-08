import { useState } from "react";
import { api, errorMessages } from "../../api/client";
import { useApi } from "../../lib/useApi";

export default function TeacherExamsTab() {
  const [subTab, setSubTab] = useState("exams"); // 'exams' | 'scoresheet' | 'results'

  const myClasses = useApi("/api/academics/my-classes/");
  const exams = useApi("/api/exams/exams/");
  const sessions = useApi("/api/academics/sessions/");

  // Create Exam Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExam, setNewExam] = useState({
    name: "Continuous Assessment Test",
    assessment_type: "test",
    assignmentIndex: 0,
    term: "first",
    max_marks: 30,
    date: new Date().toISOString().split("T")[0],
  });

  // Score Sheet State
  const [activeExam, setActiveExam] = useState(null);
  const [sheetData, setSheetData] = useState([]);
  const [loadingSheet, setLoadingSheet] = useState(false);

  // Results State
  const [resultClassId, setResultClassId] = useState("");
  const [resultTerm, setResultTerm] = useState("first");
  const [resultData, setResultData] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  const currentSession = sessions.data?.find((s) => s.is_current) || sessions.data?.[0];
  const examList = exams.data?.results || (Array.isArray(exams.data) ? exams.data : []);

  function notify(msg) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  }

  function openCreateModal() {
    setErrors([]);
    setShowAddModal(true);
  }

  async function handleCreateExam(e) {
    e.preventDefault();
    if (!myClasses.data || myClasses.data.length === 0) {
      alert("You have no assigned classes.");
      return;
    }
    const chosenAssignment = myClasses.data[newExam.assignmentIndex || 0];
    if (!chosenAssignment) return;

    setSaving(true);
    setErrors([]);
    try {
      await api("/api/exams/exams/", {
        method: "POST",
        body: {
          name: newExam.name,
          assessment_type: newExam.assessment_type,
          school_class: chosenAssignment.school_class,
          subject: chosenAssignment.subject,
          session: chosenAssignment.session || currentSession?.id,
          term: newExam.term,
          max_marks: Number(newExam.max_marks),
          date: newExam.date,
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
        `/api/exams/results/class/?school_class=${resultClassId}&term=${resultTerm}`
      );
      setResultData(data);
    } catch (err) {
      setErrors(errorMessages(err));
      setResultData(null);
    } finally {
      setLoadingResults(false);
    }
  }

  // Extract unique classes for results view
  const uniqueClasses = [];
  const seenIds = new Set();
  (myClasses.data || []).forEach((item) => {
    if (!seenIds.has(item.school_class)) {
      seenIds.add(item.school_class);
      uniqueClasses.push({ id: item.school_class, name: item.class_name });
    }
  });

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
          <h2 className="h4 fw-bold mb-1">Assessments & Grade Book</h2>
          <p className="text-muted small mb-0">Create tests/exams for your assigned subjects and enter student marks.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
          + Create Assessment
        </button>
      </div>

      {/* Subtabs */}
      <div className="nav nav-pills gap-2 border-bottom pb-2">
        <button
          className={`btn btn-sm ${subTab === "exams" ? "btn-primary" : "btn-light"}`}
          onClick={() => { setErrors([]); setSubTab("exams"); }}
        >
          My Assessments
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
            if (!resultClassId && uniqueClasses.length > 0) {
              setResultClassId(String(uniqueClasses[0].id));
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

      {/* Assessments List */}
      {subTab === "exams" && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Term</th>
                  <th>Max Marks</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.loading && (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">Loading assessments…</td></tr>
                )}
                {!exams.loading && examList.length === 0 && (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No assessments created for your subjects yet. Click "+ Create Assessment" above.</td></tr>
                )}
                {examList.map((exam) => (
                  <tr key={exam.id}>
                    <td className="fw-semibold">{exam.name}</td>
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
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openScoreSheet(exam)}
                      >
                        Enter Scores
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Score Sheet */}
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
              ← Back to Assessments
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
                              placeholder="e.g. Good performance"
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

      {/* Class Results */}
      {subTab === "results" && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <div className="row g-2 align-items-center">
              <div className="col-md-5">
                <label className="form-label small fw-semibold mb-1">My Class</label>
                <select
                  className="form-select form-select-sm"
                  value={resultClassId}
                  onChange={(e) => setResultClassId(e.target.value)}
                >
                  <option value="">-- Choose Class --</option>
                  {uniqueClasses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold mb-1">Term</label>
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
                  {loadingResults ? "Compiling…" : "View Results"}
                </button>
              </div>
            </div>
          </div>

          <div className="card-body">
            {loadingResults && (
              <div className="text-center py-5 text-muted">
                <span className="spinner-border spinner-border-sm me-2" /> Compiling class marks and positions…
              </div>
            )}

            {!loadingResults && resultData && (
              <div>
                <h5 className="fw-bold mb-3">
                  Result Sheet: {resultData.class} ({resultData.term?.toUpperCase()} TERM)
                </h5>
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

      {/* Modal: Create Assessment */}
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
                      placeholder="e.g. Test 1, Mid-Term Exam"
                      required
                      value={newExam.name}
                      onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Class & Subject *</label>
                    <select
                      className="form-select form-select-sm"
                      required
                      value={newExam.assignmentIndex}
                      onChange={(e) => setNewExam({ ...newExam, assignmentIndex: Number(e.target.value) })}
                    >
                      {myClasses.data?.map((a, idx) => (
                        <option key={a.id} value={idx}>
                          {a.subject_name} in {a.class_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={newExam.assessment_type}
                        onChange={(e) => setNewExam({ ...newExam, assessment_type: e.target.value })}
                      >
                        <option value="test">Test</option>
                        <option value="exam">Exam</option>
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
                      <label className="form-label small fw-semibold">Maximum Marks *</label>
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
