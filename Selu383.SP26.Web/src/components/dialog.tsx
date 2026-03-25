import { T } from "./tokens";
import { Ic } from "./icons";

export const Dialog = ({ open, onClose, width = 520, children }: { open: boolean; onClose: () => void; width?: number; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(58,46,31,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "relative", background: T.white, borderRadius: T.rLg,
        width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "auto",
        boxShadow: T.shadowLg,
        animation: "clFadeUp 0.25s ease-out",
      }}>
        <button onClick={onClose} className="cl-focus-ring" style={{
          position: "absolute", top: 16, right: 16, zIndex: 10,
          background: T.white, border: `1px solid ${T.sand}`, borderRadius: 8,
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "background 0.2s", boxShadow: T.shadow,
        }}><Ic name="x" size={16} color={T.mocha} /></button>
        {children}
      </div>
    </div>
  );
};
