import { FaGraduationCap } from "react-icons/fa";
import { education } from "../data/education";

export default function Education() {
  return (
    <section id="education" className="min-h-[80vh] bg-mist-100 py-20">
      <h2 className="flex items-center justify-center gap-3 font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <FaGraduationCap className="text-indigo-600" /> My <span className="text-orange-500">Education</span>
      </h2>
      <p className="mx-auto mt-3 max-w-xl px-6 text-center font-body text-lg font-semibold text-navy-800">
        Education is not the learning of facts, but the training of the mind to think.
      </p>

      <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center gap-5 px-4 sm:px-6">
        {education.map(({ title, school, period, image }) => (
          <div
            key={title}
            className="flex min-h-36 w-full flex-row overflow-hidden rounded-lg bg-white shadow-[0.2rem_0.5rem_1rem_rgba(0,0,0,0.2)] transition duration-300 hover:scale-[1.02] hover:shadow-[1rem_0.5rem_1.2rem_rgba(0,0,0,0.3)]"
          >
            <div className="w-28 shrink-0 sm:w-52">
              <img draggable="false" src={image} alt={title} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-[1_1_24rem] flex-col justify-center p-4">
              <h3 className="text-left text-lg font-semibold text-navy-deep sm:text-xl">{title}</h3>
              <p className="mt-1 text-left text-sm text-navy-800">{school}</p>
              <h4 className="mt-2 text-left font-display text-base font-bold text-green-700">{period}</h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}