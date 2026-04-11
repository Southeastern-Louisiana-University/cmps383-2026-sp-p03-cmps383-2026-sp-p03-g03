import type { CSSProperties } from "react";
import { T } from "../styles/tokens";

export const BackgroundArt = () => {
  const style = {
    "--bg-green-muted": `${T.greenMuted}10`,
    "--bg-warm-tan": `${T.warmTan}0D`,
  } as CSSProperties;

  return (
    <div className="bg-art" style={style}>
      <div className="bg-art-orb bg-art-orb-top" />
      <div className="bg-art-orb bg-art-orb-bottom" />
    </div>
  );
};
