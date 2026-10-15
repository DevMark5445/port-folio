import ApiError from "./ApiError.js";

function optionalUrl(value, label, { allowRelative = false } = {}) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string" || value.length > 2048) {
    throw new ApiError(400, `${label} must be a URL no longer than 2048 characters.`);
  }

  if (allowRelative && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    throw new ApiError(400, `${label} must be a valid HTTP or HTTPS URL.`);
  }
  throw new ApiError(400, `${label} must be a valid HTTP or HTTPS URL.`);
}

export function validateProjectPayload(payload, { partial = false } = {}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApiError(400, "Project details must be provided as an object.");
  }

  const fields = [
    ["title", 120],
    ["category", 80],
    ["description", 1000],
  ];
  const result = {};

  for (const [field, maximumLength] of fields) {
    const value = payload[field];
    if (partial && value === undefined) {
      continue;
    }
    if (typeof value !== "string" || !value.trim()) {
      throw new ApiError(400, `${field} is required.`);
    }
    if (value.trim().length > maximumLength) {
      throw new ApiError(400, `${field} must be no longer than ${maximumLength} characters.`);
    }
    result[field] = value.trim();
  }

  if (!partial && fields.some(([field]) => !Object.hasOwn(result, field))) {
    throw new ApiError(400, "Project title, category, and description are required.");
  }

  if (Object.hasOwn(payload, "repository_url") || !partial) {
    const repositoryUrl = optionalUrl(payload.repository_url, "GitHub repository URL");
    if (repositoryUrl && !/^https:\/\/(?:www\.)?github\.com\/[^/]+\/[^/]+(?:\/|$)/i.test(repositoryUrl)) {
      throw new ApiError(400, "Repository URL must point to github.com.");
    }
    result.repository_url = repositoryUrl;
  }

  if (Object.hasOwn(payload, "image_alt") || !partial) {
    const imageAlt = payload.image_alt;
    if (imageAlt !== undefined && imageAlt !== null && typeof imageAlt !== "string") {
      throw new ApiError(400, "Image description must be text.");
    }
    if (typeof imageAlt === "string" && imageAlt.trim().length > 250) {
      throw new ApiError(400, "Image description must be no longer than 250 characters.");
    }
    result.image_alt = typeof imageAlt === "string" && imageAlt.trim() ? imageAlt.trim() : null;
  }

  if (Object.hasOwn(payload, "image_url") || !partial) {
    result.image_url = optionalUrl(payload.image_url, "Preview image URL", { allowRelative: true });
  }
  if (Object.hasOwn(payload, "live_url") || !partial) {
    result.live_url = optionalUrl(payload.live_url, "Live project URL");
  }
  if (Object.hasOwn(payload, "sort_order")) {
    if (!Number.isInteger(payload.sort_order) || payload.sort_order < 0) {
      throw new ApiError(400, "sort_order must be a non-negative integer.");
    }
    result.sort_order = payload.sort_order;
  }

  if (partial && Object.keys(result).length === 0) {
    throw new ApiError(400, "At least one project field must be provided.");
  }

  return result;
}
