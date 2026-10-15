import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    image_url: { type: String, default: null, maxlength: 2048 },
    image_alt: { type: String, default: null, maxlength: 250 },
    repository_url: { type: String, default: null, maxlength: 2048 },
    live_url: { type: String, default: null, maxlength: 2048 },
    sort_order: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_document, result) {
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  },
);

projectSchema.index({ sort_order: 1, createdAt: -1 });

const Project = mongoose.model("Project", projectSchema);

export { Project };
export default Project;
