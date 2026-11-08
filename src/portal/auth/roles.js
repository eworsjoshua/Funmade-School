export const ROLES = ["admin", "teacher", "student"];

// Where each role lands after login. Unknown roles get null.
export const homeFor = (role) => (ROLES.includes(role) ? `/${role}` : null);
