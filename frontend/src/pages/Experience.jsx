import { FaBriefcase, FaArrowUp } from "react-icons/fa";
import { experience } from "../data/experience";

export default function Experience() {
  return (
    <section id="experience" className="bg-[#f7f7f7] py-20">
      <h2 className="flex items-center justify-center gap-3 font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <FaBriefcase className="text-navy-950" /> Experience
      </h2>

      <div className="mx-auto mt-14 max-w-5xl px-6 sm:px-10">
        <div className="relative">
          {/* vertical line: left on mobile, centered on sm+ */}
          <div className="absolute bottom-0 left-6 top-0 w-1 -translate-x-1/2 rounded bg-[#05053a] sm:left-1/2" />

          <ul className="flex flex-col gap-8">
            {experience.map(({ company, role, period }, i) => {
              const onRight = i % 2 === 0;
              return (
                <li
                  key={`${company}-${role}-${period}`}
                  className={`relative w-full pl-16 sm:w-1/2 ${
                    onRight ? "sm:ml-auto sm:pl-12" : "sm:pl-0 sm:pr-12"
                  }`}
                >
                  {/* node: orange ring, white fill, navy briefcase */}
                  <span
                    aria-hidden
                    className={`absolute left-6 top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-[#fb9a4b] bg-white text-sm text-[#05053a] ${
                      onRight ? "sm:left-0" : "sm:left-full"
                    }`}
                  >
                    <FaBriefcase />
                  </span>

                  {/* orange card with pointer arrow */}
                  <div
                    className={`relative rounded-md bg-[#f98d0a] px-4 py-3 text-black shadow-sm
                      before:absolute before:top-1/2 before:-left-4 before:-translate-y-1/2 before:border-8 before:border-transparent before:border-r-[#f98d0a] ${
                        onRight
                          ? ""
                          : "sm:before:-right-4 sm:before:left-auto sm:before:border-r-transparent sm:before:border-l-[#f98d0a]"
                      }`}
                  >
                    <h3 className="font-display text-xl font-bold">{company}</h3>
                    <p className="mt-0.5 font-display text-base font-semibold">{role}</p>
                    <p className="mt-0.5 font-display text-xs">{period}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
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