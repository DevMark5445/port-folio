import ApiError from "../utils/ApiError.js";

export function notFoundHandler(request, _response, next) {
  next(new ApiError(404, `No API route exists for ${request.method} ${request.path}.`));
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
    return;
  }
  if (error.name === "CastError") {
    response.status(400).json({ error: "The requested project ID is invalid." });
    return;
  }
  if (error.name === "MongoServerError" && error.code === 11000) {
    response.status(409).json({ error: "An administrator with that username or email already exists." });
    return;
  }
  if (error.type === "entity.parse.failed") {
    response.status(400).json({ error: "The request body must contain valid JSON." });
    return;
  }
  if (error.type === "entity.too.large") {
    response.status(413).json({ error: "The request body is too large." });
    return;
  }

  const statusCode = error.message === "This website origin is not allowed by the API." ? 403 : 500;
  if (statusCode === 500) {
    console.error("API request failed:", error);
  }
  response.status(statusCode).json({
    error: statusCode === 500 ? "An unexpected server error occurred." : error.message,
  });
}
