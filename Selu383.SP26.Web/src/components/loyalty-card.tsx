import type { CSSProperties } from "react";
import { LOGO } from "../styles/tokens";
import "./loyalty-card.css";

export const LoyaltyCard = ({
  user,
}: {
  user: { name: string; points: number };
}) => {
  const progressStyle = { width: `${user.points % 100}%` } as CSSProperties;

  return (
    <div className="loyalty-card">
      <div className="loyalty-orb" />
      <div className="loyalty-logo-wrap">
        <img src={LOGO} alt="" className="loyalty-logo" />
      </div>
      <p className="loyalty-kicker">Lion's Rewards</p>{" "}
      {/* to the right of this, there could be a rewards level status indicator */}
      <div className="loyalty-points-row">
        <span className="loyalty-points-value">{user.points}</span>
        <span className="loyalty-points-label">points</span>
      </div>
      <div className="loyalty-progress-track">
        <div className="loyalty-progress-fill" style={progressStyle} />
      </div>
      <div className="loyalty-footer-row">
        <span className="loyalty-footer-copy">
          {user.points} points available
        </span>
        {
          //This should feature an item or something that can be redeemed with the current points/a goal item with an amount of points
          //For example, "Keep Going to redeem a [insert item] for [some amount of] points!" with maybe a profile pic of the item(s)?
        }
      </div>
    </div>
  );
};
