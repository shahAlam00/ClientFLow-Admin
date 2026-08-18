import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Scale, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Practice Areas" },
  { to: "/blog", label: "Blog" },
  { to: "/updates", label: "Legal Updates" },
  { to: "/news", label: "News & Events" },
  { to: "/podcasts", label: "Podcasts" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container-pro flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <Scale className={`h-7 w-7 transition-colors ${scrolled ? "text-primary" : "text-gold"}`} />
          <span className={`font-serif text-xl ${scrolled ? "text-primary" : "text-primary-foreground"}`}>
            Ashish <span className="text-gold">&amp;</span> Pawar
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors ${
                  scrolled ? "text-foreground" : "text-primary-foreground/90"
                } hover:text-gold ${isActive ? "text-gold" : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button asChild variant="gold" size="sm">
            <Link to="/book">Book Consultation</Link>
          </Button>
        </div>

        <button
          aria-label="Toggle menu"
          className={`lg:hidden ${scrolled ? "text-foreground" : "text-primary-foreground"}`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-background border-t border-border">
          <div className="container-pro py-4 flex flex-col gap-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2 text-foreground hover:text-gold"
              >
                {l.label}
              </NavLink>
            ))}
            <Button asChild variant="gold" size="sm" className="mt-2">
              <Link to="/book" onClick={() => setOpen(false)}>Book Consultation</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
