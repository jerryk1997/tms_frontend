// =================== API ENDPOINTS ==================
const API_VERSION = "/api/v1";
const AUTH_API_BASE = `${API_VERSION}/auth`;
const USER_API_BASE = `${API_VERSION}/user`;
const ADMIN_API_BASE = `${API_VERSION}/admin`;

export const AUTH_API = {
  login: `${AUTH_API_BASE}/login`,
  logout: `${AUTH_API_BASE}/logout`,
  verifySession: `${AUTH_API_BASE}/verify-session`,
  verifyGroup: group => `${AUTH_API_BASE}/verify/${group}`
};

export const USER_API = {
  currentUser: `${USER_API_BASE}/profile`
};

export const ADMIN_API = {
  getAllUsers: `${ADMIN_API_BASE}/user/all`,
  getAllGroups: `${ADMIN_API_BASE}/group/all`,
  createGroup: `${ADMIN_API_BASE}/group`,
  editUser: username => `${ADMIN_API_BASE}/user/${username}`
};

// =================== DISPATCH ACTIONS ==================
export const ACTION = {
  // App
  login: "login",
  logout: "logout",
  flashMessage: "flashMessage",
  fetchUser: "fetch",

  // User management
  populateUsers: "populateUsers",
  editUser: "editUser",
  populateGroups: "populateGroups",
  createGroup: "createGroup"
};

export const HTTP_CODES = {
  // SUCCESS
  success: 200,
  created: 201,
  noContent: 204,

  // CLIENT ERROR
  unauthorised: 401,
  notFound: 404,
  conflict: 409,

  // SERVER ERROR
  serverError: 500
};
