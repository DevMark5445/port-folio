import AdminUser from "../models/AdminUser.js";
import { signToken } from "../middleware/auth.js";
import { validateAdminRegistration } from "../utils/validateAdminRegistration.js";

export async function setupStatus(_request, response, next) {
  try {
    const setupRequired = await AdminUser.countDocuments({ account_slot: "admin" }) === 0;
    response.json({ setupRequired });
  } catch (error) {
    next(error);
  }
}

export async function registerAdmin(request, response, next) {
  try {
    const credentials = validateAdminRegistration(request.body);
    let user;
    try {
      user = await AdminUser.create(credentials);
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
      response.status(409).json({ error: "Administrator setup has already been completed." });
      return;
    }

    response.status(201).json({
      token: signToken(user.safe()),
      user: user.safe(),
    });
  } catch (error) {
    next(error);
  }
}

export async function login(request, response, next) {
  try {
    const { identifier, password } = request.body || {};
    if (typeof identifier !== "string" || typeof password !== "string") {
      response.status(400).json({ error: "Enter your admin username or email and password." });
      return;
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();
    const user = normalizedIdentifier.includes("@")
      ? await AdminUser.findByEmail(normalizedIdentifier)
      : await AdminUser.findByUsername(normalizedIdentifier);

    if (!user || !await user.verifyPassword(password)) {
      response.status(401).json({ error: "Invalid administrator username or password." });
      return;
    }

    response.json({
      token: signToken(user.safe()),
      user: user.safe(),
    });
  } catch (error) {
    next(error);
  }
}

export function currentAdmin(request, response) {
  response.json({ user: request.user });
}
