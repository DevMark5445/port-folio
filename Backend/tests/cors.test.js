import assert from "node:assert/strict";
import test from "node:test";
import app from "../app.js";

test("CORS allows local and deployed frontends but rejects unknown origins", async (context) => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));

  const { port } = server.address();
  async function preflight(origin) {
    return fetch(`http://127.0.0.1:${port}/api/auth/setup-status`, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "content-type",
      },
    });
  }

  for (const origin of [
    "http://localhost:5173",
    "https://port-folio-indol-nine.vercel.app",
  ]) {
    const response = await preflight(origin);
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), origin);
  }

  const rejectedResponse = await preflight("https://unapproved.example");
  assert.equal(rejectedResponse.status, 403);
  assert.equal(rejectedResponse.headers.get("access-control-allow-origin"), null);
});
