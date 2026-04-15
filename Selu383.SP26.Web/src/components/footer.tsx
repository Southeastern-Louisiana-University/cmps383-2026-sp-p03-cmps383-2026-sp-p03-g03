import { useEffect, useState } from "react";
import { LOGO } from "../styles/tokens";
import { useAppContext } from "../api/context-providers/app-context";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../navigation/routes";
import "./footer.css";

interface FooterLocationDto {
  id: number;
  name: string;
  phone: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  openingTime: string | null;
  closingTime: string | null;
}

function formatAddress(l: FooterLocationDto): string {
  const parts = [l.address, l.city, [l.state, l.zip].filter(Boolean).join(" ")].filter(Boolean);
  return parts.join(", ");
}

function formatHours(opening: string | null, closing: string | null): string {
  if (!opening || !closing) return "Hours vary";
  const o = parseTime(opening);
  const c = parseTime(closing);
  return `Mon\u2013Sun: ${o} \u2013 ${c}`;
}

function parseTime(iso: string): string {
  const [h, m] = iso.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${m.toString().padStart(2, "0")}${ampm}`;
}

export function Footer() {
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const [location, setLocation] = useState<FooterLocationDto | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/locations", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() as Promise<FooterLocationDto[]> : Promise.reject()))
      .then((arr) => {
        if (Array.isArray(arr) && arr.length > 0) setLocation(arr[0]);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <footer className="footer-root">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-row">
              <img
                src={LOGO}
                alt="Caffeinated Lions"
                className="footer-brand-logo"
              />
              <span className="footer-brand-text">Caffeinated Lions</span>
            </div>
            <p className="footer-brand-copy">
              Handcrafted drinks, crepes, and bagels. Pouring pride into every
              cup.
            </p>
            {/* <div className="footer-social-row">
              {["instagram", "twitter", "facebook"].map((s) => (
                <div key={s} className="footer-social-dot">
                  {s[0].toUpperCase()}
                </div>
              ))}
            </div> */}
          </div>

          <div>
            <h4 className="footer-col-title">Menu</h4>
            {[
              { l: "Drinks", route: APP_ROUTES.menu },
              { l: "Sweet Crepes", route: APP_ROUTES.menu },
              { l: "Savory Crepes", route: APP_ROUTES.menu },
              { l: "Bagels", route: APP_ROUTES.menu },
            ].map((item) => (
              <button
                key={item.l}
                onClick={() => navigate(item.route)}
                className="footer-link"
              >
                {item.l}
              </button>
            ))}
          </div>

          <div>
            <h4 className="footer-col-title">Account</h4>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate(APP_ROUTES.profile)}
                  className="footer-link"
                >
                  My Profile
                </button>
                <button
                  onClick={() => navigate(APP_ROUTES.orders)}
                  className="footer-link"
                >
                  My Orders
                </button>
                <p className="footer-link footer-link-text">Rewards</p>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate(APP_ROUTES.auth)}
                  className="footer-link"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate(APP_ROUTES.auth)}
                  className="footer-link"
                >
                  Create Account
                </button>
              </>
            )}
          </div>

          <div>
            <h4 className="footer-col-title">Visit Us</h4>
            {location ? (
              <>
                <p className="footer-visit-copy">
                  {location.name}
                  <br />
                  {formatAddress(location)}
                  {location.phone && (
                    <>
                      <br />
                      {location.phone}
                    </>
                  )}
                </p>
                <p className="footer-visit-copy footer-visit-copy-late">
                  {formatHours(location.openingTime, location.closingTime)}
                </p>
              </>
            ) : (
              <>
                <p className="footer-visit-copy">
                  Find us at one of our Louisiana locations.
                </p>
                <p className="footer-visit-copy footer-visit-copy-late">
                  Mon&ndash;Sun: 6am &ndash; 6pm
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
