import assert from "node:assert/strict";
import test from "node:test";
import ApiError from "../utils/ApiError.js";
import { validateProjectPayload } from "../utils/validateProject.js";

test("validates and normalizes project fields", () => {
  const project = validateProjectPayload({
    title: "  Portfolio app  ",
    category: "Web app",
    description: "A project description",
    repository_url: "https://github.com/owner/repository",
    live_url: "https://example.com",
    image_url: "/projects/preview.png",
    image_alt: "Preview image",
  });

  assert.equal(project.title, "Portfolio app");
  assert.equal(project.image_url, "/projects/preview.png");
  assert.equal(project.sort_order, undefined);
});

test("rejects missing required fields and non-GitHub repository links", () => {
  assert.throws(
    () => validateProjectPayload({ title: "Project", category: "Web" }),
    (error) => error instanceof ApiError && error.statusCode === 400,
  );
  assert.throws(
    () => validateProjectPayload({
      title: "Project",
      category: "Web",
      description: "Details",
      repository_url: "https://example.com/repo",
    }),
    (error) => error instanceof ApiError && error.message.includes("github.com"),
  );
});

test("rejects unsafe URL protocols and empty partial updates", () => {
  assert.throws(
    () => validateProjectPayload({
      title: "Project",
      category: "Web",
      description: "Details",
      live_url: "javascript:alert(1)",
    }),
    (error) => error instanceof ApiError && error.message.includes("HTTP or HTTPS"),
  );
  assert.throws(
    () => validateProjectPayload({}, { partial: true }),
    (error) => error instanceof ApiError && error.message.includes("At least one"),
  );
});
