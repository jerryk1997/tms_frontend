// =================== API ENDPOINTS ==================
const API_VERSION = "/api/v1";
export const AUTH_API = {
  login: `${API_VERSION}/auth/login`,
  logout: `${API_VERSION}/auth/logout`,
  verifySession: `${API_VERSION}/auth/verify/session`
};

export const USER_API = {
  currentUser: `${API_VERSION}/user/profile`
};

// =================== DISPATCH ACTIONS ==================
export const ACTION = {
  login: "login",
  logout: "logout",
  flashMessage: "flashMessage",
  fetchUser: "fetch"
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
