import { FaLinkedin, FaGithub, FaTwitter, FaTelegramPlane, FaInstagram, FaDev, FaArrowCircleDown, FaCode, FaEnvelope, FaPaperPlane } from "react-icons/fa";
import { useEffect, useRef } from "react";
import { useTypewriter } from "../hooks/useTypewriter";
import ParticleBackground from "./Particle";
import About from "./About";
import Skills from "./Skills";
import Education from "./Education";
import Experience from "./Experience";

const socials = [
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/jigar-sable/", label: "LinkedIn", hover: "hover:bg-[#007bb6]" },
  { icon: FaGithub, href: "https://github.com/jigar-sable", label: "GitHub", hover: "hover:bg-[#0e0e0e]" },
  { icon: FaTwitter, href: "https://twitter.com/jigar_sable", label: "Twitter", hover: "hover:bg-[#00aced]" },
  { icon: FaTelegramPlane, href: "https://t.me/lifecode5", label: "Telegram", hover: "hover:bg-[#0685da]" },
  { icon: FaInstagram, href: "https://www.instagram.com/jigarsable.dev", label: "Instagram", hover: "hover:bg-[#ee00da]" },
  { icon: FaDev, href: "https://dev.to/jigarsable", label: "Dev.to", hover: "hover:bg-[#070707]" },
];

export default function Hero() {
  const typed = useTypewriter(["Web Development", "Cyber Security", "Ethical Hacking", "UI/UX Design", "Problem Solving"]);
  const pageRef = useRef(null);

  useEffect(() => {
    const sections = pageRef.current?.querySelectorAll(":scope > section");
    if (!sections?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={pageRef} className="home-page">
      <section id="home" className="relative flex min-h-screen items-center overflow-hidden bg-white">
      <div aria-hidden className="particle-field pointer-events-none absolute inset-0">
        <ParticleBackground color="37, 99, 235" count={180} maxDistance={140} speed={0.35} />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-28 sm:px-10 lg:grid-cols-2 lg:px-16">
        <div>
          <h1 className="font-display text-[2.75rem] font-extrabold leading-[1.1] text-navy-deep sm:text-6xl lg:text-7xl">
            Hi There,
            <br />
            I'm Markderrick <span className="text-orange-500">Nguyagwa</span>
          </h1>

          <p className="mt-6 min-h-[2.5rem] text-2xl font-semibold text-navy-950 sm:text-3xl">
            i am into{" "}
            <span className="text-red-800">
              {typed}
              <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-red-800 align-middle" style={{ height: "1.6rem" }} />
            </span>
          </p>

          <a
            href="#about"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 font-display text-base font-bold tracking-wide text-white shadow-lg shadow-indigo-600/40 transition hover:bg-indigo-700"
          >
            About Me
            <FaArrowCircleDown className="text-lg transition group-hover:translate-x-1" />
          </a>

          <ul className="mt-16 flex flex-wrap gap-2">
            {socials.map(({ icon: Icon, href, label, hover }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={`flex h-11 w-11 items-center justify-center rounded-full bg-navy-800 text-xl text-cyan-400 transition-colors duration-200 hover:text-white ${hover}`}
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto flex justify-center lg:justify-end">
          <img
            draggable="false"
            className="w-[70%] max-w-sm cursor-pointer rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-shadow hover:shadow-[0_5px_15px_rgba(0,0,0,0.5)] lg:w-full"
            src="/images/hero.png"
            alt="Illustration of Jigar Sable"
          />
        </div>
      </div>
      </section>
      <About />
      <Skills />
      <Experience />
      <Education />

      <section id="work" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <h2 className="flex items-center justify-center gap-3 font-display text-3xl font-bold text-navy-950 sm:text-4xl">
            <FaCode className="text-orange-500" /> Featured <span className="text-orange-500">Work</span>
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { title: "Web App Development", text: "Modern front-end and full-stack interfaces built for performance, responsiveness, and a polished user experience." },
              { title: "Business Solutions", text: "Custom digital products designed to improve workflows, user engagement, and business growth." },
              { title: "UI/UX Craft", text: "Clean interfaces and conversion-focused design systems tailored to product goals and audience needs." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-xl font-bold text-navy-950">{item.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center sm:px-10">
          <h2 className="flex items-center justify-center gap-3 font-display text-3xl font-bold sm:text-4xl">
            <FaEnvelope className="text-orange-500" /> Let&apos;s <span className="text-orange-500">Connect</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            I&apos;m available for freelance work, product collaboration, and full-stack development opportunities.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            <a
              href="mailto:nguyagwamarkderrick@gmail.com"
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-400"
            >
              <FaPaperPlane />
              nguyagwamarkderrick@gmail.com
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap justify-center gap-3">
            {socials.map(({ icon: Icon, href, label, hover }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-lg text-white transition hover:text-white ${hover}`}
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}