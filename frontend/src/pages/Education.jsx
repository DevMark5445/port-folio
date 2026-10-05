import { FaGraduationCap } from "react-icons/fa";
import { education } from "../data/education";

export default function Education() {
  return (
    <section id="education" className="bg-blue-50 py-20">
      <h2 className="flex items-center justify-center gap-3 font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <FaGraduationCap className="text-orange-500" /> Education
      </h2>

      <div className="mx-auto mt-10 grid max-w-6xl gap-6 px-6 sm:grid-cols-2 sm:px-10">
        {education.map(({ title, school, period, image }) => (
          <article key={title} className="overflow-hidden rounded-lg bg-white shadow-sm">
            <img src={image} alt="" className="aspect-video w-full object-cover" />
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-navy-950">{title}</h3>
              <p className="mt-2 text-slate-700">{school}</p>
              <p className="mt-1 text-sm font-semibold text-orange-600">{period}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}