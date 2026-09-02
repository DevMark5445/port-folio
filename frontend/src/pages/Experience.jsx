import { FaBriefcase, FaArrowUp } from "react-icons/fa";
import { experience } from "../data/experience";

export default function Experience() {
  return (
    <section id="experience" className="bg-white py-20">
      <h2 className="flex items-center justify-center gap-3 font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <FaBriefcase className="text-orange-600" /> Experience
      </h2>

      <div className="relative mx-auto mt-14 max-w-5xl px-6 sm:px-10">
        {/* vertical line: left-aligned on mobile, centered on sm+ */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-navy-600 sm:left-1/2 sm:-translate-x-1/2" />

        <ul className="flex flex-col gap-8">
          {experience.map(({ company, role, period }, i) => {
            const onRight = i % 2 === 0;
            return (
              <li
                key={`${company}-${role}`}
                className={`relative flex w-full pl-20 sm:w-1/2 sm:pl-0 sm:pr-10 ${
                  onRight ? "sm:ml-auto sm:pl-10 sm:pr-0" : ""
                }`}
              >
                {/* dot */}
                <span
                  className={`absolute top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full border-4 border-orange-600 bg-white left-4 sm:left-auto ${
                    onRight ? "sm:-left-3.5" : "sm:-right-3.5"
                  }`}
                  aria-hidden
                />
                <div className="w-full rounded-lg bg-orange-600 px-6 py-5">
                  <p className="text-sm font-semibold text-white/90">{company}</p>
                  <h3 className="mt-1 text-lg font-semibold text-navy-950">{role}</h3>
                  <p className="mt-1 text-sm text-navy-800">{period}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-14 flex justify-center">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-4 font-display text-lg font-semibold tracking-wide text-white shadow-lg shadow-indigo-600/40 transition hover:bg-indigo-700"
        >
          Scroll Up
          <FaArrowUp className="text-base transition group-hover:-translate-y-1" />
        </button>
      </div>
    </section>
  );
}