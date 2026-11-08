import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { ApiError, errorMessages } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { homeFor } from "../auth/roles";
import { SCHOOL_NAME } from "../config";
import "../portal.css";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [slow, setSlow] = useState(false);

  const home = user && homeFor(user.role);
  if (!loading && home) return <Navigate to={home} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors([]);
    setSubmitting(true);
    const timer = setTimeout(() => setSlow(true), 4000); // free servers can be slow to wake up
    try {
      const me = await login(username.trim(), password);
      const target = homeFor(me.role);
      if (!target) setErrors(["Your account does not have portal access."]);
      else navigate(target, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setErrors(["Wrong username or password."]);
      else if (err instanceof ApiError) setErrors(errorMessages(err));
      else setErrors(["Could not reach the server. Please try again in a moment."]);
    } finally {
      clearTimeout(timer);
      setSubmitting(false);
      setSlow(false);
    }
  }

  return (
    <div className="container bg-light" style={{ maxWidth: "100%" }}>
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-sm-10 col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 text-center fw-bold mb-1" style={{ color: "#1e3a8a" }}>
                {SCHOOL_NAME}
              </h1>
              <p className="text-center text-muted small mb-4">Sign in to the school portal</p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    id="username"
                    className="form-control"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {errors.length > 0 && (
                  <div className="alert alert-danger py-2" role="alert">
                    <ul className="mb-0 ps-3">
                      {errors.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? "Signing in…" : "Sign in"}
                </button>
                {slow && (
                  <p className="text-center text-muted small mt-3 mb-0">
                    The server is waking up. This can take up to a minute the first time.
                  </p>
                )}
              </form>
            </div>
          </div>
          <p className="text-center mt-3 small">
            <Link to="/">← Back to the school website</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
