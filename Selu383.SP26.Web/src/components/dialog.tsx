import { Ic } from "./icons";

export const Dialog = ({
  open,
  onClose,
  width = 520,
  children,
}: {
  open: boolean;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="dialog-root">
      <div onClick={onClose} className="dialog-backdrop" />
      <div className="dialog-panel" style={{ maxWidth: width }}>
        <button onClick={onClose} className="focus-ring dialog-close">
          <Ic name="x" size={16} color="#8b7355" />
        </button>
        {children}
      </div>
    </div>
  );
};
