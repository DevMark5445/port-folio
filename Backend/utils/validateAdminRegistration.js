import ApiError from "./ApiError.js";

export function validateAdminRegistration(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApiError(400, "Administrator details must be provided as an object.");
  }

  const username = typeof payload.username === "string"
    ? payload.username.trim().toLowerCase()
    : "";
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
    throw new ApiError(400, "Username must be 3 to 32 characters using letters, numbers, dots, underscores, or hyphens.");
  }

  const email = typeof payload.email === "string"
    ? payload.email.trim().toLowerCase()
    : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Enter a valid email address.");
  }

  if (
    typeof payload.password !== "string"
    || payload.password.length < 12
    || payload.password.length > 128
    || !payload.password.trim()
  ) {
    throw new ApiError(400, "Password must be 12 to 128 characters and cannot be blank.");
  }

  return { username, email, password: payload.password };
}
