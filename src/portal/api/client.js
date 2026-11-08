import { API_URL } from "../config";

// The short-lived access token stays in memory; the refresh token survives page reloads.
let accessToken = null;
let onAuthFailure = () => {};
let refreshing = null;

export const tokens = {
  setAccess(token) {
    accessToken = token;
  },
  getRefresh() {
    return localStorage.getItem("refresh_token");
  },
  setRefresh(token) {
    localStorage.setItem("refresh_token", token);
  },
  clear() {
    accessToken = null;
    localStorage.removeItem("refresh_token");
  },
};

export function setAuthFailureHandler(fn) {
  onAuthFailure = fn;
}

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.detail || "Something went wrong.");
    this.status = status;
    this.data = data;
  }
}

async function refreshAccessToken() {
  const refresh = tokens.getRefresh();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    accessToken = (await res.json()).access;
    return true;
  } catch {
    return false;
  }
}

// If several requests fail at once, only one refresh is made
function refreshOnce() {
  if (!refreshing) {
    refreshing = refreshAccessToken().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

export async function api(path, { method = "GET", body, auth = true } = {}) {
  const send = () =>
    fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  let res = await send();

  if (res.status === 401 && auth) {
    if (await refreshOnce()) {
      res = await send();
    } else {
      tokens.clear();
      onAuthFailure();
    }
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

// Turns the API's error shapes into a list of readable messages
export function errorMessages(err) {
  const data = err?.data;
  if (!data) return [err?.message || "Something went wrong."];
  if (typeof data === "string") return [data];
  const out = [];
  const walk = (value, label) => {
    if (Array.isArray(value)) value.forEach((v) => walk(v, label));
    else if (value && typeof value === "object")
      Object.entries(value).forEach(([key, v]) => walk(v, key));
    else
      out.push(
        label && label !== "detail" && label !== "non_field_errors"
          ? `${label}: ${value}`
          : String(value)
      );
  };
  walk(data);
  return out;
}
