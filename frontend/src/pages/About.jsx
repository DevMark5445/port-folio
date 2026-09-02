import { FaUserAlt, FaChevronRight } from "react-icons/fa";

export default function About() {
  return (
    <section id="about" className="bg-white py-20">
      <h2 className="flex items-center justify-center gap-3 font-display text-3xl font-bold text-navy-950 sm:text-4xl">
        <FaUserAlt className="text-orange-500" /> About <span className="text-orange-500">Me</span>
      </h2>

      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center gap-10 px-6 sm:px-10">
        <div className="mx-auto flex-1 basis-80 text-center">
          <img
            draggable="false"
            className="mx-auto w-4/5 max-w-sm rounded-2xl shadow-[0_5px_10px_rgba(0,0,0,0.6)] mix-blend-luminosity transition duration-300 hover:mix-blend-normal sm:w-full"
            src="/images/profile2.jpg"
            alt="Jigar Sable"
          />
        </div>

        <div className="flex-1 basis-96">
          <h3 className="text-3xl font-semibold text-navy-950">I'm Markderrick Nguyagwa</h3>
          <span className="mt-2 block text-sm font-semibold uppercase tracking-wide text-navy-600">
            Full Stack Developer
          </span>

          <p className="mt-6 font-body text-lg font-semibold leading-relaxed text-navy-800">
            I am a Full-Stack developer based in Nairobi, Kenya. I am an Information Technology
            undergraduate from Kabete National Polytechnic. I am very passionate about improving my coding skills &amp;
            developing applications &amp; websites. I build  Websites and Web Applications using the MERN (MongoDB, Express.js, React.js, Node.js) Stack. I am a Full-Stack Developer with a strong foundation in both front-end and back-end development. I have experience working with the MERN
            Stack — and I love building full-stack clones to sharpen my craft.
          </p>

          <div className="mt-6 font-body font-semibold text-navy-800">
            <p>
              <span className="text-indigo-600">email : </span> nguyagwamarkderrick@gmail.com
            </p>
            <p className="mt-1">
              <span className="text-indigo-600">place : </span> Nairobi, Kenya - 00100
            </p>
          </div>

          <div className="mt-14">
            <a
              href="https://drive.google.com/file/d/1rZiXl562q7aVyk1kJ2nO85YBAq8ixTiw/view"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-4 font-display text-lg font-semibold tracking-wide text-white shadow-lg shadow-indigo-600/40 transition hover:bg-indigo-700"
            >
              Resume
              <FaChevronRight className="text-base transition group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}