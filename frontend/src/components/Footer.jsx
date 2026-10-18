import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaTelegramPlane,
  FaInstagram,
  FaDev,
  FaEnvelope,
  FaArrowUp,
} from "react-icons/fa";

const socials = [
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/jigar-sable/", label: "LinkedIn", hover: "hover:bg-[#007bb6]" },
  { icon: FaGithub, href: "https://github.com/DevMark5445", label: "GitHub", hover: "hover:bg-[#0e0e0e]" },
  { icon: FaTwitter, href: "https://twitter.com/jigar_sable", label: "Twitter", hover: "hover:bg-[#00aced]" },
  { icon: FaTelegramPlane, href: "https://t.me/lifecode5", label: "Telegram", hover: "hover:bg-[#0685da]" },
  { icon: FaInstagram, href: "https://www.instagram.com/jigarsable.dev", label: "Instagram", hover: "hover:bg-[#ee00da]" },
  { icon: FaDev, href: "https://dev.to/jigarsable", label: "Dev.to", hover: "hover:bg-[#070707]" },
];

const links = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#work" },
  { label: "Contact", href: "#contact" },
];

const interests = ["Web Development", "Cyber Security", "Ethical Hacking", "UI/UX Design"];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950 text-slate-300">
      {/* soft orange glow, matches the accent colour */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-16 sm:px-10 lg:px-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <a href="#home" className="font-display text-2xl font-extrabold text-white">
              Markderrick <span className="text-orange-500">Nguyagwa</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Building secure, good-looking web experiences. Open to freelance work and product collaboration.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {socials.map(({ icon: Icon, href, label, hover }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 text-lg text-cyan-400 transition-colors duration-200 hover:text-white ${hover}`}
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer">
            <h3 className="font-display text-lg font-bold text-white">
              Quick <span className="text-orange-500">Links</span>
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="inline-block transition duration-200 hover:translate-x-1 hover:text-orange-400"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Interests */}
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              What I <span className="text-orange-500">Do</span>
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {interests.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Get in <span className="text-orange-500">Touch</span>
            </h3>
            <p className="mt-5 text-sm text-slate-400">Have a project in mind? Send me a message.</p>
            <a
              href="mailto:nguyagwamarkderrick@gmail.com"
              className="mt-4 inline-flex items-center gap-2 break-all rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              <FaEnvelope aria-hidden className="shrink-0" />
              nguyagwamarkderrick@gmail.com
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row">
          <p>
            &copy; {year} Markderrick Nguyagwa. All rights reserved.
          </p>

          <a
            href="#home"
            aria-label="Back to top"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
          >
            Back to top
            <FaArrowUp aria-hidden className="transition group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}