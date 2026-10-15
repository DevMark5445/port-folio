import assert from "node:assert/strict";
import test from "node:test";
import ApiError from "../utils/ApiError.js";
import { validateAdminRegistration } from "../utils/validateAdminRegistration.js";

test("normalizes valid administrator registration details", () => {
  assert.deepEqual(
    validateAdminRegistration({
      username: "  Portfolio.Admin ",
      email: "  ADMIN@example.com ",
      password: "a-strong-password",
    }),
    {
      username: "portfolio.admin",
      email: "admin@example.com",
      password: "a-strong-password",
    },
  );
});

test("rejects invalid usernames, email addresses, and weak passwords", () => {
  const validFields = {
    username: "portfolio-admin",
    email: "admin@example.com",
    password: "a-strong-password",
  };

  for (const invalid of [
    { ...validFields, username: "a" },
    { ...validFields, username: "invalid name" },
    { ...validFields, email: "invalid-email" },
    { ...validFields, password: "short" },
    { ...validFields, password: "             " },
  ]) {
    assert.throws(
      () => validateAdminRegistration(invalid),
      (error) => error instanceof ApiError && error.statusCode === 400,
    );
  }
});

test("rejects missing or non-object administrator details", () => {
  assert.throws(
    () => validateAdminRegistration(null),
    (error) => error instanceof ApiError && error.statusCode === 400,
  );
  assert.throws(
    () => validateAdminRegistration([]),
    (error) => error instanceof ApiError && error.statusCode === 400,
  );
});
