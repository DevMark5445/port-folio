const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("portfolio_token") || "";
}

function setToken(token) {
  if (token) {
    localStorage.setItem("portfolio_token", token);
  } else {
    localStorage.removeItem("portfolio_token");
  }
}

function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function request(path, { method = "GET", body = undefined } = {}) {
  const options = { method, headers: getHeaders() };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error || response.statusText || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  getProjects: () => request("/projects"),
  getProject: (id) => request(`/projects/${id}`),
  getSetupStatus: () => request("/auth/setup-status"),
  registerAdmin: (credentials) =>
    request("/auth/register", { method: "POST", body: credentials }),
  login: (identifier, password) =>
    request("/auth/login", { method: "POST", body: { identifier, password } }),
  me: () => request("/auth/me"),
  createProject: (data) => request("/projects", { method: "POST", body: data }),
  updateProject: (id, data) =>
    request(`/projects/${id}`, { method: "PUT", body: data }),
  deleteProject: (id) =>
    request(`/projects/${id}`, { method: "DELETE" }),
  reorderProjects: (order) =>
    request("/projects/reorder", { method: "PATCH", body: { order } }),
  fetchGithubDetails: (repositoryUrl) =>
    request(`/github/details?repository_url=${encodeURIComponent(repositoryUrl)}`),
  importGithubProject: (repositoryUrl) =>
    request("/github/import", {
      method: "POST",
      body: { repository_url: repositoryUrl },
    }),
  setToken,
  getToken,
};

export default api;
