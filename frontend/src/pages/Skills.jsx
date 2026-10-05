import { FaLaptopCode } from "react-icons/fa";
import { skills } from "../data/skills";

export default function Skills() {
  return (
    <section id="skills" className="min-h-[70vh] bg-blue-50 py-20">
      <h2 className="skills-heading flex items-center justify-center gap-3 font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <FaLaptopCode className="text-indigo-600" /> My <span className="text-orange-500">Skills</span>
      </h2>

      <div className="skills-content mx-auto mt-10 w-[92%] max-w-6xl rounded-2xl bg-white/80 p-6 sm:p-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {skills.map(({ name, icon: Icon, color }) => (
            <div
              key={name}
              className="skill-card flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl bg-navy-800/90 p-4 shadow-md transition duration-200 hover:bg-black hover:shadow-[0_8px_10px_rgba(0,2,68,0.8)]"
            >
              <Icon className="text-5xl" style={{ color }} />
              <span className="skill-name text-center font-display text-lg font-bold leading-tight text-black drop-shadow-sm sm:text-xl">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}