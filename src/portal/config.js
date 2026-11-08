// The live backend. To test against a backend on your own computer, put
// VITE_API_URL=http://127.0.0.1:8000 in a file called .env.local (it is git-ignored).
export const API_URL =
  import.meta.env.VITE_API_URL || "https://funmade-college-backend-app.onrender.com";

export const SCHOOL_NAME = "Funmade Blueberry School";
