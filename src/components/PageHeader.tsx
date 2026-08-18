import { ReactNode } from "react";

export const PageHeader = ({ eyebrow, title, subtitle }: { eyebrow: string; title: ReactNode; subtitle?: string }) => (
  <section className="pt-36 pb-16 bg-primary text-primary-foreground relative overflow-hidden">
    <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: "radial-gradient(circle at 80% 20%, hsl(var(--gold)) 0%, transparent 40%)",
    }} />
    <div className="container-pro relative">
      <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">{eyebrow}</span>
      <h1 className="font-serif text-5xl md:text-6xl mt-3 max-w-3xl">{title}</h1>
      {subtitle && <p className="mt-5 text-primary-foreground/70 text-lg max-w-2xl">{subtitle}</p>}
      <span className="gold-divider mt-8" />
    </div>
  </section>
);
