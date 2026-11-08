import { useState } from "react";
import { api, errorMessages } from "../api/client";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState([]);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors([]);
    setDone(false);
    if (newPassword !== confirm) {
      setErrors(["The new passwords do not match."]);
      return;
    }
    setSubmitting(true);
    try {
      await api("/api/auth/change-password/", {
        method: "POST",
        body: { old_password: oldPassword, new_password: newPassword },
      });
      setDone(true);
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setErrors(errorMessages(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 className="h3 mb-4">Change password</h1>
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="old-password">Current password</label>
              <input id="old-password" type="password" className="form-control" autoComplete="current-password"
                required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="new-password">New password</label>
              <input id="new-password" type="password" className="form-control" autoComplete="new-password"
                required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="confirm-password">Confirm new password</label>
              <input id="confirm-password" type="password" className="form-control" autoComplete="new-password"
                required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {errors.length > 0 && (
              <div className="alert alert-danger py-2" role="alert">
                <ul className="mb-0 ps-3">{errors.map((m, i) => <li key={i}>{m}</li>)}</ul>
              </div>
            )}
            {done && <div className="alert alert-success py-2">Password changed.</div>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : "Change password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
