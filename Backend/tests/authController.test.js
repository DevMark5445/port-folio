import assert from "node:assert/strict";
import test from "node:test";
import AdminUser from "../models/AdminUser.js";
import { registerAdmin, setupStatus } from "../controllers/authController.js";

function createResponse() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function restoreProperty(target, key, descriptor) {
  if (descriptor) {
    Object.defineProperty(target, key, descriptor);
  } else {
    delete target[key];
  }
}

test("registration allows one administrator and rejects concurrent attempts", async () => {
  const countDescriptor = Object.getOwnPropertyDescriptor(AdminUser, "countDocuments");
  const createDescriptor = Object.getOwnPropertyDescriptor(AdminUser, "create");
  const originalSecret = process.env.JWT_SECRET;
  let administratorCreated = false;

  Object.defineProperty(AdminUser, "countDocuments", {
    configurable: true,
    value: async () => (administratorCreated ? 1 : 0),
  });
  Object.defineProperty(AdminUser, "create", {
    configurable: true,
    value: async ({ username, email }) => {
      await Promise.resolve();
      if (administratorCreated) {
        const error = new Error("Duplicate administrator account.");
        error.code = 11000;
        throw error;
      }
      administratorCreated = true;
      return { safe: () => ({ id: "admin-1", username, email }) };
    },
  });
  process.env.JWT_SECRET = "test-secret-that-is-at-least-thirty-two-characters";

  try {
    const request = {
      body: {
        username: "portfolio-admin",
        email: "admin@example.com",
        password: "a-strong-password",
      },
    };
    const responses = [createResponse(), createResponse()];
    await Promise.all(
      responses.map((response) => registerAdmin(request, response, assert.fail)),
    );

    assert.deepEqual(
      responses.map(({ statusCode }) => statusCode).sort(),
      [201, 409],
    );
    assert.equal(responses.filter(({ body }) => body?.token).length, 1);
  } finally {
    restoreProperty(AdminUser, "countDocuments", countDescriptor);
    restoreProperty(AdminUser, "create", createDescriptor);
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  }
});

test("setup status reports only whether the admin account has been claimed", async () => {
  const countDescriptor = Object.getOwnPropertyDescriptor(AdminUser, "countDocuments");

  try {
    Object.defineProperty(AdminUser, "countDocuments", {
      configurable: true,
      value: async (filter) => (filter.account_slot === "admin" ? 0 : 1),
    });
    const response = createResponse();
    await setupStatus({}, response, assert.fail);
    assert.deepEqual(response.body, { setupRequired: true });

    Object.defineProperty(AdminUser, "countDocuments", {
      configurable: true,
      value: async () => 1,
    });
    const configuredResponse = createResponse();
    await setupStatus({}, configuredResponse, assert.fail);
    assert.deepEqual(configuredResponse.body, { setupRequired: false });
  } finally {
    restoreProperty(AdminUser, "countDocuments", countDescriptor);
  }
});

test("registration atomically claims a legacy seeded admin record", async () => {
  const findOneAndUpdateDescriptor = Object.getOwnPropertyDescriptor(AdminUser, "findOneAndUpdate");
  let updateFilter;
  let update;
  let options;

  try {
    Object.defineProperty(AdminUser, "findOneAndUpdate", {
      configurable: true,
      value: async (filter, changes, queryOptions) => {
        updateFilter = filter;
        update = changes;
        options = queryOptions;
        return { username: changes.$set.username };
      },
    });

    const user = await AdminUser.create({
      username: "portfolio-admin",
      email: "admin@example.com",
      password: "a-strong-password",
    });

    assert.deepEqual(updateFilter, { account_slot: { $exists: false } });
    assert.equal(update.$set.account_slot, "admin");
    assert.equal(update.$set.username, "portfolio-admin");
    assert.equal(update.$set.email, "admin@example.com");
    assert.notEqual(update.$set.password_hash, "a-strong-password");
    assert.deepEqual(options, { new: true, runValidators: true });
    assert.equal(user.username, "portfolio-admin");
  } finally {
    restoreProperty(AdminUser, "findOneAndUpdate", findOneAndUpdateDescriptor);
  }
});

test("the administrator account slot has a unique database index", () => {
  const index = AdminUser.schema.indexes().find(([keys]) => keys.account_slot === 1);
  assert.ok(index);
  assert.equal(index[1].unique, true);
});
