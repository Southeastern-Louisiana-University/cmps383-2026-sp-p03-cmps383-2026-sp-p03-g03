import conceptLogo from "./assets/ConceptLogo2.png";

export const T = {
  cream: "#FAF6F1",
  sand: "#F0E8DD",
  warmTan: "#E5D5C3",
  caramel: "#C4A882",
  mocha: "#8B7355",
  espresso: "#5C4A32",
  darkBrew: "#1d1715",
  green: "#65a30d",
  greenLight: "#8bc82b",
  greenDark: "#558c0a",
  greenMuted: "#d4e9b3",
  greenVibrant: "#7ec914",
  lime: "#aee535",
  white: "#FFFFFF",

  shadow: "0 1px 3px rgba(58,46,31,0.06), 0 1px 2px rgba(58,46,31,0.04)",
  shadowMd: "0 4px 16px rgba(58,46,31,0.08), 0 1px 3px rgba(58,46,31,0.06)",
  shadowLg: "0 12px 40px rgba(58,46,31,0.12), 0 4px 12px rgba(58,46,31,0.06)",
  shadowHover: "0 8px 28px rgba(58,46,31,0.12), 0 2px 6px rgba(58,46,31,0.06)",

  r: "12px",
  rSm: "8px",
  rLg: "16px",
  rXl: "20px",

  font: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontDisplay: "'Playfair Display', Georgia, serif",

  heroImg:
    "https://images.unsplash.com/photo-1764175761007-ae6c79e802b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwY29mZmVlJTIwc2hvcCUyMGludGVyaW9yJTIwbW9vZHklMjB3YXJtJTIwbGlnaHRpbmd8ZW58MXx8fHwxNzc0MzM1OTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  latteImg:
    "https://images.unsplash.com/photo-1608363087711-9280f549a29e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMG92ZXJoZWFkJTIwY2xvc2V1cCUyMGNvZmZlZXxlbnwxfHx8fDE3NzQzMzU5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  beansImg:
    "https://images.unsplash.com/photo-1769437082791-8c9af44d7c28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFucyUyMHJvYXN0ZWQlMjBkYXJrJTIwdGV4dHVyZXxlbnwxfHx8fDE3NzQzMzU5Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  cafeImg:
    "https://images.unsplash.com/photo-1745851446590-dbb4fe5b7f45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwY2FmZSUyMHRhYmxlJTIwcGFzdHJ5JTIwY29mZmVlJTIwd2FybXxlbnwxfHx8fDE3NzQzMzU5ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  crepeImg:
    "https://images.unsplash.com/photo-1635709579812-b3256d639756?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNyZXBlJTIwZnJ1aXQlMjBicmVha2Zhc3QlMjBwbGF0ZXxlbnwxfHx8fDE3NzQzMzU5ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  icedImg:
    "https://images.unsplash.com/photo-1773632996574-45b0d56ff809?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VkJTIwY29mZmVlJTIwZ2xhc3MlMjBzdW1tZXIlMjBkcmlua3xlbnwxfHx8fDE3NzQzMzU5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  dineImg:
    "https://images.unsplash.com/photo-1762806883627-4bcbfad98a2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjB3YXJtJTIwd29vZGVuJTIwY296eSUyMGV2ZW5pbmd8ZW58MXx8fHwxNzc0MzM1OTgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
};

export const LOGO = conceptLogo;

export const CSS_TOKENS = {
  "--cream": T.cream,
  "--sand": T.sand,
  "--warm-tan": T.warmTan,
  "--caramel": T.caramel,
  "--mocha": T.mocha,
  "--espresso": T.espresso,
  "--dark-brew": T.darkBrew,
  "--green": T.green,
  "--green-light": T.greenLight,
  "--green-dark": T.greenDark,
  "--green-muted": T.greenMuted,
  "--green-vibrant": T.greenVibrant,
  "--lime": T.lime,
  "--white": T.white,
  "--bg-green-muted": T.greenMuted,
  "--bg-warm-tan": T.warmTan,
  "--shadow": T.shadow,
  "--shadow-md": T.shadowMd,
  "--shadow-lg": T.shadowLg,
  "--shadow-hover": T.shadowHover,
  "--radius": T.r,
  "--radius-sm": T.rSm,
  "--radius-lg": T.rLg,
  "--radius-xl": T.rXl,
} as const;

export const applyCssTokens = (
  root: HTMLElement = document.documentElement,
): void => {
  Object.entries(CSS_TOKENS).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
};

export const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: T.white,
  borderRadius: T.r,
  border: `1px solid ${T.sand}`,
  boxShadow: T.shadow,
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
  ...extra,
});

export const btnP: React.CSSProperties = {
  background: T.green,
  color: T.white,
  border: "none",
  borderRadius: T.rSm,
  padding: "14px 32px",
  fontFamily: T.font,
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  letterSpacing: "0.2px",
  transition: "background 0.2s, transform 0.1s",
};

export const btnO: React.CSSProperties = {
  background: "transparent",
  color: T.green,
  border: `1.5px solid ${T.green}`,
  borderRadius: T.rSm,
  padding: "12px 24px",
  fontFamily: T.font,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  transition: "background 0.2s, color 0.2s",
};

export const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: T.mocha,
  marginBottom: 8,
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  fontFamily: T.font,
};

export const inp: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: T.rSm,
  border: `1px solid ${T.warmTan}`,
  fontFamily: T.font,
  fontSize: 15,
  color: T.darkBrew,
  background: T.white,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

export const selSt: React.CSSProperties = {
  ...inp,
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235C4A32' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 16px center",
};

export const noiseOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  opacity: 0.03,
  pointerEvents: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  backgroundSize: "128px 128px",
};
