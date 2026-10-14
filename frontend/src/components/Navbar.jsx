
import { useState } from "react";
import { FaBars, FaMoon, FaSun, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = ({ isDarkMode, onToggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Education", href: "#education" },
    { name: "Projects", href: "#work" },
    { name: "Experience", href: "#experience" },
    { name: "Contact", href: "#contact" },
  ];

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-md">
      <div className="flex h-14 w-full items-center justify-between px-3 sm:px-4 lg:px-6">
        
        {/* Logo */}
        <a
          href="#home"
          onClick={closeMenu}
          className="flex items-center gap-2 text-2xl font-bold text-gray-900 transition-colors duration-300 hover:text-blue-600"
          aria-label="Marktech - Home"
        >
          <span>MarkTech</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:block" aria-label="Main navigation">
          <ul className="flex items-center gap-1">
            {navItems.map((item, index) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={`relative block px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    index === 0
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {item.name}

                  {/* Active underline */}
                  {index === 0 && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-blue-600" />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            to="/admin"
            className="rounded-md border border-indigo-600 px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Admin
          </Link>

          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-gray-800 transition-colors hover:bg-gray-100 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            aria-pressed={isDarkMode}
            title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="rounded-lg p-2 text-2xl text-gray-800 transition-colors hover:bg-gray-100 hover:text-blue-600 md:hidden"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className={`fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto bg-white px-5 py-4 transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="flex min-h-full flex-col justify-start gap-2">
          {navItems.map((item, index) => (
            <li key={item.name}>
              <a
                href={item.href}
                onClick={closeMenu}
                className={`block rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ${
                  index === 0
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                {item.name}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/admin"
              onClick={closeMenu}
              className="block rounded-lg bg-indigo-50 px-4 py-3 text-base font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              Admin sign in
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
