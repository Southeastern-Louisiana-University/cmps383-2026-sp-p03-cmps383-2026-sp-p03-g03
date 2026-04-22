import conceptLogo from "./assets/ConceptLogo2.png";

const cssVar = (name: string): string => `var(--${name})`;

export const Tokens = {
  cream: cssVar("cream"),
  sand: cssVar("sand"),
  warmTan: cssVar("warm-tan"),
  caramel: cssVar("caramel"),
  mocha: cssVar("mocha"),
  espresso: cssVar("espresso"),
  darkBrew: cssVar("dark-brew"),
  green: cssVar("green"),
  greenLight: cssVar("green-light"),
  greenDark: cssVar("green-dark"),
  greenMuted: cssVar("green-muted"),
  greenVibrant: cssVar("green-vibrant"),
  lime: cssVar("lime"),
  white: cssVar("white"),

  shadow: cssVar("shadow"),
  shadowMd: cssVar("shadow-md"),
  shadowLg: cssVar("shadow-lg"),
  shadowHover: cssVar("shadow-hover"),

  r: cssVar("radius-base"),
  rSm: cssVar("radius-sm-base"),
  rLg: cssVar("radius-lg-base"),
  rXl: cssVar("radius-xl-base"),

  font: cssVar("font-body"),
  fontDisplay: cssVar("font-display"),

  heroImg:
    "https://images.unsplash.com/photo-1764175761007-ae6c79e802b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwY29mZmVlJTIwc2hvcCUyMGludGVyaW9yJTIwbW9vZHklMjB3YXJtJTIwbGlnaHRpbmd8ZW58MXx8fHwxNzc0MzM1OTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  latteImg: "/menu-pics/categories/hot-latte.png",
  bagelImg: "/menu-pics/categories/bagels.png",
  cafeImg:
    "https://images.unsplash.com/photo-1745851446590-dbb4fe5b7f45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwY2FmZSUyMHRhYmxlJTIwcGFzdHJ5JTIwY29mZmVlJTIwd2FybXxlbnwxfHx8fDE3NzQzMzU5ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  sweetCrepeImg: "/menu-pics/categories/sweet-crepes.png",
  savoryCrepeImg: "/menu-pics/categories/savory-crepes.png",
  icedImg: "/menu-pics/categories/iced-latte.png",
  dineImg:
    "https://images.unsplash.com/photo-1762806883627-4bcbfad98a2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjB3YXJtJTIwd29vZGVuJTIwY296eSUyMGV2ZW5pbmd8ZW58MXx8fHwxNzc0MzM1OTgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
};

export const LOGO = conceptLogo;

export const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: Tokens.white,
  borderRadius: Tokens.r,
  border: `1px solid ${Tokens.sand}`,
  boxShadow: Tokens.shadow,
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
  ...extra,
});

export const btnP: React.CSSProperties = {
  background: Tokens.green,
  color: Tokens.white,
  border: "none",
  borderRadius: Tokens.rSm,
  padding: "14px 32px",
  fontFamily: Tokens.font,
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  letterSpacing: "0.2px",
  transition: "background 0.2s, transform 0.1s",
};

export const btnO: React.CSSProperties = {
  background: "transparent",
  color: Tokens.green,
  border: `1.5px solid ${Tokens.green}`,
  borderRadius: Tokens.rSm,
  padding: "12px 24px",
  fontFamily: Tokens.font,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  transition: "background 0.2s, color 0.2s",
};

export const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: Tokens.mocha,
  marginBottom: 8,
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  fontFamily: Tokens.font,
};

export const inp: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: Tokens.rSm,
  border: `1px solid ${Tokens.warmTan}`,
  fontFamily: Tokens.font,
  fontSize: 15,
  color: Tokens.darkBrew,
  background: Tokens.white,
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
