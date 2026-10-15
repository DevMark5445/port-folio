import mongoose from "mongoose";
import AdminUser from "../models/AdminUser.js";
import Project from "../models/Project.js";

const initialProjects = [
  {
    title: "Westlands Church Website",
    category: "Church website",
    description: "A live website project created for Westlands Church.",
    image_url: "/projects/westlands-church-project.png",
    image_alt: "Screenshot of the Westlands P.A.G Church website homepage",
    repository_url: "https://github.com/DevMark5445/Westlands-church",
    live_url: "https://westlands-church-9ncv.vercel.app",
    sort_order: 0,
  },
  {
    title: "Hospital Queue System",
    category: "Queue management",
    description: "A web project for organizing queues in a hospital setting.",
    image_url: "/projects/hospital-queue-project.jpg",
    image_alt: "Hospital waiting room image used by the queue system project",
    repository_url: "https://github.com/DevMark5445/Hospital-qeue-system",
    live_url: "https://hospital-queue-system.vercel.app",
    sort_order: 1,
  },
];

export async function connectDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  await AdminUser.init();

  if (await Project.estimatedDocumentCount() === 0) {
    await Project.insertMany(initialProjects);
  }

  console.log("Connected to MongoDB.");
}
