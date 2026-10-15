import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema(
  {
    account_slot: { type: String, default: "admin", unique: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password_hash: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, result) {
        delete result._id;
        delete result.__v;
        delete result.password_hash;
        return result;
      },
    },
  },
);

adminUserSchema.statics.findByUsername = function findByUsername(username) {
  return this.findOne({ username: username.trim().toLowerCase() }).select("+password_hash");
};

adminUserSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: email.trim().toLowerCase() }).select("+password_hash");
};

adminUserSchema.statics.create = async function createAdmin({ username, email, password }) {
  const password_hash = await bcrypt.hash(password, 12);

  const legacyAdmin = await this.findOneAndUpdate(
    { account_slot: { $exists: false } },
    { $set: { account_slot: "admin", username, email, password_hash } },
    { new: true, runValidators: true },
  );
  if (legacyAdmin) {
    return legacyAdmin;
  }

  return new this({ username, email, password_hash }).save();
};

adminUserSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.password_hash);
};

adminUserSchema.methods.safe = function safe() {
  return {
    id: this.id,
    username: this.username,
    email: this.email,
  };
};

const AdminUser = mongoose.model("AdminUser", adminUserSchema);

export { AdminUser };
export default AdminUser;
