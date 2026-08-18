import { Link } from "react-router-dom";
import { Scale } from "lucide-react";

export const Footer = () => (
  <footer className="bg-primary text-primary-foreground mt-24">
    <div className="container-pro py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-7 w-7 text-gold" />
          <span className="font-serif text-2xl">Ashish &amp; Pawar</span>
        </div>
        <p className="text-primary-foreground/70 max-w-md leading-relaxed">
          Trusted legal counsel built on integrity, expertise, and an unwavering commitment
          to our clients' success.
        </p>
      </div>
      <div>
        <h4 className="font-serif text-gold mb-4 text-lg">Explore</h4>
        <ul className="space-y-2 text-primary-foreground/70">
          <li><Link to="/about" className="hover:text-gold transition-colors">About</Link></li>
          <li><Link to="/blog" className="hover:text-gold transition-colors">Blog</Link></li>
          <li><Link to="/updates" className="hover:text-gold transition-colors">Legal Updates</Link></li>
          <li><Link to="/podcasts" className="hover:text-gold transition-colors">Podcasts</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-serif text-gold mb-4 text-lg">Contact</h4>
        <ul className="space-y-2 text-primary-foreground/70 text-sm">
          <li>221B Justice Avenue</li>
          <li>Mumbai, MH 400001</li>
          <li>+91 98765 43210</li>
          <li>contact@sterlingvance.law</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-primary-foreground/10">
      <div className="container-pro py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-primary-foreground/50">
        <p>© {new Date().getFullYear()} Sterling &amp; Vance Advocates. All rights reserved.</p>
        <p>Privacy · Terms · Disclaimer</p>
      </div>
    </div>
  </footer>
);
