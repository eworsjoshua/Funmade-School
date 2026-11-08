import { useState } from "react";
import { api, errorMessages } from "../../api/client";
import { naira } from "../../lib/format";
import { useApi } from "../../lib/useApi";

export default function FeesSection() {
  const [subTab, setSubTab] = useState("structures"); // 'structures' | 'payments' | 'outstanding' | 'online'

  const structures = useApi("/api/fees/structures/");
  const payments = useApi("/api/fees/payments/");
  const classes = useApi("/api/academics/classes/");
  const sessions = useApi("/api/academics/sessions/");
  const students = useApi("/api/students/");
  const onlineTxs = useApi("/api/fees/online/transactions/");

  // New Fee Structure Modal
  const [showAddStructure, setShowAddStructure] = useState(false);
  const [newStructure, setNewStructure] = useState({
    name: "Tuition Fee",
    school_class: "",
    session: "",
    term: "first",
    amount: "",
    description: "",
    due_date: "",
  });

  // Record Payment Modal
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    student: "",
    fee: "",
    amount: "",
    payment_method: "bank_transfer",
    notes: "",
  });

  // Void Payment Modal
  const [voidPaymentTarget, setVoidPaymentTarget] = useState(null);
  const [voidReason, setVoidReason] = useState("");

  // Outstanding Report State
  const [filterClassId, setFilterClassId] = useState("");
  const outstanding = useApi(
    `/api/fees/balances/outstanding/${filterClassId ? `?school_class=${filterClassId}` : ""}`
  );

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  const currentSession = sessions.data?.find((s) => s.is_current) || sessions.data?.[0];
  const studentList = students.data?.results || (Array.isArray(students.data) ? students.data : []);
  const structureList = structures.data?.results || (Array.isArray(structures.data) ? structures.data : []);
  const paymentList = payments.data?.results || (Array.isArray(payments.data) ? payments.data : []);
  const onlineList = onlineTxs.data?.results || (Array.isArray(onlineTxs.data) ? onlineTxs.data : []);

  function notify(msg) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  }

  function openAddFeeStructure() {
    setErrors([]);
    setNewStructure({
      name: "Tuition Fee",
      school_class: classes.data?.[0]?.id || "",
      session: currentSession?.id || "",
      term: "first",
      amount: "50000",
      description: "Term tuition fee",
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setShowAddStructure(true);
  }

  async function handleCreateStructure(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await api("/api/fees/structures/", {
        method: "POST",
        body: {
          ...newStructure,
          school_class: Number(newStructure.school_class),
          session: Number(newStructure.session || currentSession?.id),
          amount: Number(newStructure.amount),
        },
      });
      setShowAddStructure(false);
      notify("Fee structure created successfully.");
      structures.reload();
    } catch (err) {
      setErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  function openRecordPayment() {
    setErrors([]);
    setNewPayment({
      student: studentList[0]?.id || "",
      fee: structureList[0]?.id || "",
      amount: "",
      payment_method: "bank_transfer",
      notes: "",
    });
    setShowAddPayment(true);
  }

  async function handleRecordPayment(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      const res = await api("/api/fees/payments/", {
        method: "POST",
        body: {
          ...newPayment,
          student: Number(newPayment.student),
          fee: Number(newPayment.fee),
          amount: Number(newPayment.amount),
        },
      });
      setShowAddPayment(false);
      notify(`Payment recorded! Receipt #${res.receipt_number}`);
      payments.reload();
      outstanding.reload();
    } catch (err) {
      setErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleVoidPayment(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await api(`/api/fees/payments/${voidPaymentTarget.id}/void/`, {
        method: "POST",
        body: { reason: voidReason },
      });
      setVoidPaymentTarget(null);
      setVoidReason("");
      notify("Payment voided.");
      payments.reload();
      outstanding.reload();
    } catch (err) {
      setErrors(errorMessages(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStructure(id, name) {
    if (!window.confirm(`Delete fee structure "${name}"?`)) return;
    try {
      await api(`/api/fees/structures/${id}/`, { method: "DELETE" });
      notify("Fee structure deleted.");
      structures.reload();
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

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h2 className="h4 fw-bold mb-1">School Fees Management</h2>
          <p className="text-muted small mb-0">Define fees, record tuition payments, print receipts, and track outstanding balances.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm" onClick={openRecordPayment}>
            + Record Payment
          </button>
          <button className="btn btn-outline-primary btn-sm" onClick={openAddFeeStructure}>
            + Define Fee Structure
          </button>
        </div>
      </div>

      {/* Subtabs */}
      <div className="nav nav-pills gap-2 border-bottom pb-2">
        <button
          className={`btn btn-sm ${subTab === "structures" ? "btn-primary" : "btn-light"}`}
          onClick={() => { setErrors([]); setSubTab("structures"); }}
        >
          Fee Structures
        </button>
        <button
          className={`btn btn-sm ${subTab === "payments" ? "btn-primary" : "btn-light"}`}
          onClick={() => { setErrors([]); setSubTab("payments"); }}
        >
          Payment Transactions
        </button>
        <button
          className={`btn btn-sm ${subTab === "outstanding" ? "btn-primary" : "btn-light"}`}
          onClick={() => { setErrors([]); setSubTab("outstanding"); }}
        >
          Outstanding Debtors
        </button>
        <button
          className={`btn btn-sm ${subTab === "online" ? "btn-primary" : "btn-light"}`}
          onClick={() => { setErrors([]); setSubTab("online"); }}
        >
          Online Transactions (Paystack)
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

      {/* --- SUBTAB 1: FEE STRUCTURES --- */}
      {subTab === "structures" && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Fee Name</th>
                  <th>Class</th>
                  <th>Term</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Description</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {structures.loading && (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">Loading fee structures…</td></tr>
                )}
                {!structures.loading && structureList.length === 0 && (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">No fee structures defined yet. Click "+ Define Fee Structure".</td></tr>
                )}
                {structureList.map((fee) => (
                  <tr key={fee.id}>
                    <td className="fw-semibold">{fee.name}</td>
                    <td>{fee.class_name || fee.school_class_name || `Class #${fee.school_class}`}</td>
                    <td className="text-capitalize">{fee.term} Term</td>
                    <td className="fw-bold text-primary">{naira(fee.amount)}</td>
                    <td className="small text-muted">{fee.due_date || "—"}</td>
                    <td className="small text-muted text-truncate" style={{ maxWidth: 200 }}>
                      {fee.description || "—"}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteStructure(fee.id, fee.name)}
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
      )}

      {/* --- SUBTAB 2: PAYMENTS LIST --- */}
      {subTab === "payments" && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Receipt #</th>
                  <th>Student</th>
                  <th>Fee Type</th>
                  <th>Amount Paid</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.loading && (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">Loading payments…</td></tr>
                )}
                {!payments.loading && paymentList.length === 0 && (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No payments recorded yet. Click "+ Record Payment".</td></tr>
                )}
                {paymentList.map((p) => {
                  const studentName = p.student_name || (p.student_info ? `${p.student_info.first_name} ${p.student_info.last_name}` : `Student #${p.student}`);
                  return (
                    <tr key={p.id} className={p.is_void ? "table-light text-muted" : ""}>
                      <td className="fw-semibold">
                        <span className="badge bg-primary-subtle text-primary font-monospace">
                          {p.receipt_number}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold">{studentName}</div>
                        <div className="small text-muted">{p.admission_number}</div>
                      </td>
                      <td>{p.fee_name}</td>
                      <td className="fw-bold text-success">{naira(p.amount)}</td>
                      <td className="text-capitalize small">{p.payment_method?.replace("_", " ")}</td>
                      <td className="small text-muted">{p.payment_date || p.created_at?.split("T")[0]}</td>
                      <td>
                        {p.is_void ? (
                          <span className="badge bg-danger" title={`Voided reason: ${p.void_reason}`}>
                            Voided
                          </span>
                        ) : (
                          <span className="badge bg-success">Confirmed</span>
                        )}
                      </td>
                      <td className="text-end">
                        {!p.is_void && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Void Mistaken Payment"
                            onClick={() => {
                              setVoidPaymentTarget(p);
                              setVoidReason("");
                            }}
                          >
                            Void
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: OUTSTANDING BALANCES --- */}
      {subTab === "outstanding" && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <div className="row g-2 align-items-center">
              <div className="col-md-6">
                <label className="form-label small fw-semibold mb-1">Filter by Class</label>
                <select
                  className="form-select form-select-sm"
                  value={filterClassId}
                  onChange={(e) => setFilterClassId(e.target.value)}
                >
                  <option value="">-- All Classes --</option>
                  {classes.data?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 pt-3 text-md-end">
                <span className="badge bg-danger-subtle text-danger fs-6 p-2">
                  Total Outstanding: <strong>{naira(outstanding.data?.total_outstanding ?? 0)}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {outstanding.loading && (
              <div className="text-center py-5 text-muted">
                <span className="spinner-border spinner-border-sm me-2" /> Calculating balances…
              </div>
            )}
            {!outstanding.loading && (!outstanding.data?.students || outstanding.data.students.length === 0) && (
              <div className="text-center py-5 text-muted">
                No students with outstanding balances found for this filter.
              </div>
            )}
            {!outstanding.loading && outstanding.data?.students?.length > 0 && (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Admission No</th>
                      <th>Student Name</th>
                      <th>Class</th>
                      <th>Total Fees</th>
                      <th>Paid</th>
                      <th>Balance Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outstanding.data.students.map((st) => (
                      <tr key={st.student_id || st.student}>
                        <td>
                          <span className="badge bg-primary-subtle text-primary">
                            {st.admission_number}
                          </span>
                        </td>
                        <td className="fw-semibold">{st.name}</td>
                        <td>{st.class_name}</td>
                        <td className="text-muted">{naira(st.total_fees)}</td>
                        <td className="text-success">{naira(st.total_paid)}</td>
                        <td className="fw-bold text-danger">{naira(st.outstanding)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SUBTAB 4: ONLINE PAYMENTS (PAYSTACK) --- */}
      {subTab === "online" && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <h6 className="fw-bold mb-0">Online Payment Attempts (Paystack)</h6>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Reference</th>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt #</th>
                  <th>Initiated</th>
                </tr>
              </thead>
              <tbody>
                {onlineTxs.loading && (
                  <tr><td colSpan="6" className="text-center py-4 text-muted">Loading transactions…</td></tr>
                )}
                {!onlineTxs.loading && onlineList.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-4 text-muted">No online payments initiated yet.</td></tr>
                )}
                {onlineList.map((tx) => (
                  <tr key={tx.id}>
                    <td className="font-monospace small">{tx.reference}</td>
                    <td className="fw-semibold">{tx.student_name || `Student #${tx.student}`}</td>
                    <td className="fw-bold">{naira(tx.amount)}</td>
                    <td>
                      <span
                        className={`badge ${
                          tx.status === "successful"
                            ? "bg-success"
                            : tx.status === "pending"
                            ? "bg-warning text-dark"
                            : "bg-danger"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td>{tx.receipt_number || "—"}</td>
                    <td className="small text-muted">{tx.created_at?.split("T")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Define Fee Structure */}
      {showAddStructure && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleCreateStructure}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Define Fee Structure</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddStructure(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Fee Title *</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="e.g. Tuition Fee, Exam Fee, PTA Levy"
                      required
                      value={newStructure.name}
                      onChange={(e) => setNewStructure({ ...newStructure, name: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Target Class *</label>
                      <select
                        className="form-select form-select-sm"
                        required
                        value={newStructure.school_class}
                        onChange={(e) => setNewStructure({ ...newStructure, school_class: e.target.value })}
                      >
                        <option value="">-- Choose Class --</option>
                        {classes.data?.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Term *</label>
                      <select
                        className="form-select form-select-sm"
                        value={newStructure.term}
                        onChange={(e) => setNewStructure({ ...newStructure, term: e.target.value })}
                      >
                        <option value="first">First Term</option>
                        <option value="second">Second Term</option>
                        <option value="third">Third Term</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Amount (NGN) *</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        required
                        min="100"
                        value={newStructure.amount}
                        onChange={(e) => setNewStructure({ ...newStructure, amount: e.target.value })}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Due Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={newStructure.due_date}
                        onChange={(e) => setNewStructure({ ...newStructure, due_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      value={newStructure.description}
                      onChange={(e) => setNewStructure({ ...newStructure, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddStructure(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? "Saving…" : "Create Fee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {showAddPayment && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleRecordPayment}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Record Student Payment</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddPayment(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Select Student *</label>
                    <select
                      className="form-select form-select-sm"
                      required
                      value={newPayment.student}
                      onChange={(e) => setNewPayment({ ...newPayment, student: e.target.value })}
                    >
                      <option value="">-- Choose Student --</option>
                      {studentList.map((s) => {
                        const name = s.user_info
                          ? `${s.user_info.first_name} ${s.user_info.last_name}`
                          : `Student #${s.id}`;
                        return (
                          <option key={s.id} value={s.id}>
                            {name} ({s.admission_number})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Select Fee *</label>
                    <select
                      className="form-select form-select-sm"
                      required
                      value={newPayment.fee}
                      onChange={(e) => {
                        const selectedFee = structureList.find((f) => String(f.id) === e.target.value);
                        setNewPayment({
                          ...newPayment,
                          fee: e.target.value,
                          amount: selectedFee ? selectedFee.amount : newPayment.amount,
                        });
                      }}
                    >
                      <option value="">-- Choose Fee Structure --</option>
                      {structureList.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} - {f.class_name || `Class #${f.school_class}`} ({naira(f.amount)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Amount Paid (NGN) *</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        required
                        min="1"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Payment Method</label>
                      <select
                        className="form-select form-select-sm"
                        value={newPayment.payment_method}
                        onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="pos">POS</option>
                        <option value="online">Online</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Notes / Reference</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="e.g. Bank teller ref, father paid"
                      value={newPayment.notes}
                      onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddPayment(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? "Recording…" : "Save Payment & Issue Receipt"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Void Payment */}
      {voidPaymentTarget && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleVoidPayment}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold text-danger">
                    Void Payment: {voidPaymentTarget.receipt_number}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setVoidPaymentTarget(null)} />
                </div>
                <div className="modal-body">
                  <p className="small text-muted mb-3">
                    Voiding is an audited permanent action. Please state why this payment is being voided (e.g. duplicate entry, reversed transfer).
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reason for voiding *</label>
                    <textarea
                      className="form-control form-control-sm"
                      required
                      rows="3"
                      value={voidReason}
                      onChange={(e) => setVoidReason(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setVoidPaymentTarget(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger btn-sm" disabled={saving || !voidReason.trim()}>
                    {saving ? "Voiding…" : "Confirm Void"}
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
