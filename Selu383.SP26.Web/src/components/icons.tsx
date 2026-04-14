import { Tokens } from "../styles/tokens";

export const CatIcon = ({ cat, size = 40 }: { cat: string; size?: number }) => {
  const s = { width: size, height: size, display: "block" };
  const f = Tokens.green,
    l = Tokens.greenMuted,
    sk = Tokens.greenDark;
  if (cat === "Drinks")
    return (
      <svg style={s} viewBox="0 0 40 40" fill="none">
        <rect
          x="8"
          y="10"
          width="18"
          height="22"
          rx="3"
          fill={l}
          stroke={sk}
          strokeWidth="1.5"
        />
        <path d="M26 15h4a3 3 0 010 6h-4" stroke={sk} strokeWidth="1.5" />
        <path
          d="M12 6c1-3 3-3 4 0M16 6c1-3 3-3 4 0M20 6c1-3 3-3 4 0"
          stroke={f}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity=".55"
        />
        <rect
          x="12"
          y="16"
          width="10"
          height="2"
          rx="1"
          fill={f}
          opacity=".25"
        />
      </svg>
    );
  if (cat === "Sweet Crepes")
    return (
      <svg style={s} viewBox="0 0 40 40" fill="none">
        <path
          d="M8 30L20 6l12 24z"
          fill={l}
          stroke={sk}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="22" r="2" fill={f} opacity=".45" />
        <circle cx="22" cy="20" r="1.5" fill={f} opacity=".35" />
        <circle cx="19" cy="26" r="1.5" fill={f} opacity=".3" />
        <path
          d="M13 16c2 1 5 1 7-1s5-1 7 1"
          stroke={f}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity=".4"
        />
      </svg>
    );
  if (cat === "Savory Crepes")
    return (
      <svg style={s} viewBox="0 0 40 40" fill="none">
        <path
          d="M8 30L20 6l12 24z"
          fill={l}
          stroke={sk}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <line
          x1="14"
          y1="20"
          x2="26"
          y2="20"
          stroke={f}
          strokeWidth="1.2"
          opacity=".35"
        />
        <line
          x1="16"
          y1="24"
          x2="24"
          y2="24"
          stroke={f}
          strokeWidth="1.2"
          opacity=".25"
        />
        <ellipse cx="20" cy="15" rx="3" ry="1.5" fill={f} opacity=".2" />
      </svg>
    );
  if (cat === "Bagels")
    return (
      <svg style={s} viewBox="0 0 40 40" fill="none">
        <ellipse
          cx="20"
          cy="21"
          rx="12"
          ry="9"
          fill={l}
          stroke={sk}
          strokeWidth="1.5"
        />
        <ellipse
          cx="20"
          cy="21"
          rx="5"
          ry="4"
          fill={Tokens.cream}
          stroke={sk}
          strokeWidth="1.2"
        />
        <path
          d="M10 18c3-2 6-3 10-3s7 1 10 3"
          stroke={f}
          strokeWidth="1"
          opacity=".25"
        />
      </svg>
    );
  return (
    <svg style={s} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="14" fill={l} stroke={sk} strokeWidth="1.5" />
    </svg>
  );
};

export const ItemIcon = ({
  cat,
  size = 44,
}: {
  cat: string;
  size?: number;
}) => (
  <div className="item-icon-wrap" style={{ width: size, height: size }}>
    <CatIcon cat={cat} size={size - 10} />
  </div>
);

export const Ic = ({
  name,
  size = 20,
  color = Tokens.espresso,
}: {
  name: string;
  size?: number;
  color?: string;
}) => {
  const p = { width: size, height: size, display: "block" };
  const m: Record<string, React.JSX.Element> = {
    home: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    menu: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M18 8h1a4 4 0 010 8h-1" />
        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    cart: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
    calendar: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    user: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    plus: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    minus: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    x: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    check: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    clock: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    gift: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
      </svg>
    ),
    mail: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="22 7 12 13 2 7" />
      </svg>
    ),
    lock: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    phone: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    edit: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    logout: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    heart: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    star: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    settings: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    mappin: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    cake: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v8" />
        <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
        <path d="M2 21h20" />
        <path d="M7 8v3" />
        <path d="M12 8v3" />
        <path d="M17 8v3" />
        <path d="M7 4h.01" />
        <path d="M12 4h.01" />
        <path d="M17 4h.01" />
      </svg>
    ),
    creditcard: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    eye: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    eyeoff: (
      <svg
        style={p}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
  };
  return m[name] || null;
};
