import { useState } from "react";
import { Tokens, LOGO } from "../../styles/tokens";
import { Ic, ItemIcon } from "../../components/icons";
import { LoyaltyCard } from "../../components/loyalty-card";
import { useAppContext } from "../../api/context-providers/app-context";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../navigation/routes";
import "./profile.css";

const ORDER_HISTORY = [
  {
    id: "00847",
    date: "Mar 21, 2026",
    items: ["Iced Latte", "Downtowner"],
    total: 16.25,
    status: "Completed",
  },
];

const FAVORITE_ITEMS = [
  {
    id: 1,
    name: "Iced Latte",
    price: 4.5,
    desc: "Chilled espresso with milk",
    category: "Drinks",
  },
  {
    id: 2,
    name: "Nutella Crepe",
    price: 6.75,
    desc: "Sweet crepe with Nutella",
    category: "Sweet Crepes",
  },
  {
    id: 3,
    name: "Everything Bagel",
    price: 3.25,
    desc: "Bagel with cream cheese",
    category: "Bagels",
  },
];

type ProfileTab = "overview" | "orders" | "favorites" | "settings";

export function ProfilePage() {
  const { user, setUser, logout, setSel, setQty, setNote } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [editing, setEditing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [editForm, setEditForm] = useState({
    name: user.name,
    phone: user.phone,
    birthday: user.birthday,
  });

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError("");

    const result = await logout();

    if (!result.ok) {
      setSignOutError(
        result.error ??
          "Unable to reach server, but you are signed out locally.",
      );
    }

    navigate(APP_ROUTES.auth, { replace: true });
    setSigningOut(false);
  };

  const handleSave = () => {
    setUser((prev) => ({
      ...prev,
      name: editForm.name,
      phone: editForm.phone,
      birthday: editForm.birthday,
    }));
    setEditing(false);
  };

  const tabs: { k: ProfileTab; l: string; i: string }[] = [
    { k: "overview", l: "Overview", i: "user" },
    { k: "orders", l: "Order History", i: "clock" },
    { k: "favorites", l: "Favorites", i: "heart" },
    { k: "settings", l: "Settings", i: "settings" },
  ];

  const tierClass =
    user.tier === "Gold"
      ? "profile-tier-badge-gold"
      : user.tier === "Silver"
        ? "profile-tier-badge-silver"
        : "profile-tier-badge-bronze";

  return (
    <div className="profile-page">
      <section className="card-base profile-hero-card">
        <img src={LOGO} alt="" className="profile-hero-logo" />

        <div className="profile-avatar-wrap">
          <span className="profile-avatar-letter">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="profile-flex-1">
          <div className="profile-name-row">
            <h1 className="profile-name">{user.name}</h1>
            <span className={`profile-tier-badge ${tierClass}`}>
              {user.tier} Member
            </span>
          </div>
          <p className="profile-meta">
            {user.email} &nbsp;·&nbsp; Member since {user.memberSince}
          </p>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn-outline focus-ring btn-outline-base profile-signout"
        >
          <Ic name="logout" size={16} color={Tokens.mocha} />
          {signingOut ? "Signing Out..." : "Sign Out"}
        </button>
      </section>

      {signOutError ? <p className="profile-meta">{signOutError}</p> : null}

      <div className="profile-tabs">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setActiveTab(t.k)}
            className={`focus-ring profile-tab ${activeTab === t.k ? "profile-tab-active" : "profile-tab-inactive"}`}
          >
            <Ic
              name={t.i}
              size={16}
              color={activeTab === t.k ? Tokens.green : Tokens.caramel}
            />
            {t.l}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="profile-overview-grid">
          <div>
            <div className="card-base profile-info-card">
              <div className="profile-card-header-row">
                <h3 className="profile-section-title">Personal Information</h3>
                {!editing ? (
                  <button
                    onClick={() => {
                      setEditing(true);
                      setEditForm({
                        name: user.name,
                        phone: user.phone,
                        birthday: user.birthday,
                      });
                    }}
                    className="focus-ring profile-edit-btn"
                  >
                    <Ic name="edit" size={14} color={Tokens.green} />
                    Edit
                  </button>
                ) : (
                  <div className="profile-edit-actions">
                    <button
                      onClick={() => setEditing(false)}
                      className="focus-ring btn-outline-base profile-mini-btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="btn-primary focus-ring btn-primary-base profile-mini-btn-primary"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {editing ? (
                <div className="profile-edit-grid">
                  <div className="profile-col-full">
                    <label className="label-base">Full Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="label-base">Phone</label>
                    <input
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="label-base">Birthday</label>
                    <input
                      type="date"
                      value={editForm.birthday}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, birthday: e.target.value }))
                      }
                      className="input-base"
                    />
                  </div>
                </div>
              ) : (
                <div className="profile-info-grid">
                  {[
                    { icon: "user", label: "Name", value: user.name },
                    { icon: "mail", label: "Email", value: user.email },
                    { icon: "phone", label: "Phone", value: user.phone },
                    {
                      icon: "cake",
                      label: "Birthday",
                      value: user.birthday
                        ? new Date(
                            user.birthday + "T00:00:00",
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Not set",
                    },
                  ].map((f, i, arr) => (
                    <div
                      key={f.label}
                      className={`profile-info-row ${i < arr.length - 2 ? "profile-info-row-divided" : ""}`}
                    >
                      <div className="profile-info-icon-wrap">
                        <Ic name={f.icon} size={16} color={Tokens.green} />
                      </div>
                      <div>
                        <p className="profile-info-label">{f.label}</p>
                        <p className="profile-info-value">{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-base profile-payment-card">
              <h3 className="profile-section-title profile-title-mb20">
                Payment Methods
              </h3>
              <div className="card-base profile-visa-card">
                <div className="profile-visa-logo-wrap">
                  <span className="profile-visa-logo-text">VISA</span>
                </div>
                <div className="profile-flex-1">
                  <p className="profile-visa-primary">Visa •••• 4242</p>
                  <p className="profile-visa-secondary">Expires 12/27</p>
                </div>
                <span className="profile-default-badge">Default</span>
              </div>
              <button className="focus-ring profile-add-payment-btn">
                <Ic name="plus" size={16} color={Tokens.caramel} />
                Add payment method
              </button>
            </div>
          </div>

          <div>
            <LoyaltyCard user={user} />

            <div className="card-base profile-stats-card">
              <h4 className="profile-section-title profile-title-mb20">
                Quick Stats
              </h4>
              {[
                { l: "Total Orders", v: "24" },
                { l: "This Month", v: "4 orders" },
                { l: "Points Earned", v: "+320 total" },
                { l: "Rewards Redeemed", v: "2" },
              ].map((s, i, arr) => (
                <div
                  key={s.l}
                  className={`profile-stats-row ${i < arr.length - 1 ? "profile-stats-row-divided" : ""}`}
                >
                  <span className="profile-stats-label">{s.l}</span>
                  <span className="profile-stats-value">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          <div className="profile-block-header">
            <h2 className="profile-block-title">Order History</h2>
            <p className="profile-block-copy">
              Your recent orders at Caffeinated Lions.
            </p>
          </div>
          <div className="profile-order-list">
            {ORDER_HISTORY.map((order) => (
              <div
                key={order.id}
                className="card-base card-hover profile-order-card"
              >
                <div className="profile-order-icon-wrap">
                  <Ic name="menu" size={22} color={Tokens.green} />
                </div>
                <div className="profile-flex-1">
                  <div className="profile-order-head">
                    <h4 className="profile-order-id">{order.id}</h4>
                    <span className="profile-order-date">{order.date}</span>
                  </div>
                  <p className="profile-order-items">
                    {order.items.join(", ")}
                  </p>
                </div>
                <div className="profile-order-right">
                  <p className="profile-order-total">
                    ${order.total.toFixed(2)}
                  </p>
                  <span className="profile-order-status">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "favorites" && (
        <div>
          <div className="profile-block-header">
            <h2 className="profile-block-title">Your Favorites</h2>
            <p className="profile-block-copy">
              Items you've saved for quick reordering.
            </p>
          </div>
          <div className="profile-favorites-grid">
            {FAVORITE_ITEMS.map((item) => (
              <div
                key={item.id}
                className="card-base card-hover profile-fav-card"
                onClick={() => {
                  setSel(item);
                  setQty(1);
                  setNote("");
                }}
              >
                <button className="profile-fav-heart-btn">
                  <Ic name="heart" size={18} color="#E53E3E" />
                </button>
                <ItemIcon size={56} cat={item.category} />
                <h4 className="profile-fav-title">{item.name}</h4>
                <p className="profile-fav-kicker">{item.category}</p>
                <p className="profile-fav-copy">{item.desc}</p>
                <div className="profile-fav-footer">
                  <span className="profile-fav-price">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="profile-fav-cta">Order →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="profile-settings-wrap">
          <div className="profile-block-header">
            <h2 className="profile-block-title">Preferences</h2>
            <p className="profile-block-copy">
              Manage your ordering preferences and notifications.
            </p>
          </div>

          <div className="card-base profile-setting-card">
            <div className="profile-setting-head">
              <div className="profile-setting-icon-wrap">
                <Ic name="mappin" size={16} color={Tokens.green} />
              </div>
              <h4 className="profile-setting-title">Default Location</h4>
            </div>
            <div className="profile-pill-row profile-pill-row-wrap">
              {["Downtown", "Midtown", "University"].map((loc) => (
                <button
                  key={loc}
                  onClick={() =>
                    setUser((prev) => ({ ...prev, defaultLocation: loc }))
                  }
                  className={`focus-ring profile-pill ${user.defaultLocation === loc ? "profile-pill-active" : "profile-pill-inactive"}`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="card-base profile-setting-card">
            <div className="profile-setting-head">
              <div className="profile-setting-icon-wrap">
                <Ic name="cart" size={16} color={Tokens.green} />
              </div>
              <h4 className="profile-setting-title">Default Order Type</h4>
            </div>
            <div className="profile-pill-row">
              {(["Pickup", "Drive-Thru"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setUser((prev) => ({ ...prev, defaultOrderType: type }))
                  }
                  className={`focus-ring profile-pill profile-pill-wide ${user.defaultOrderType === type ? "profile-pill-active" : "profile-pill-inactive"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="card-base profile-setting-card">
            <div className="profile-setting-head">
              <div className="profile-setting-icon-wrap">
                <Ic name="mail" size={16} color={Tokens.green} />
              </div>
              <h4 className="profile-setting-title">Receipt Preference</h4>
            </div>
            <div className="profile-pill-row profile-pill-row-wrap">
              {["Email", "Text", "Paper", "None"].map((r) => (
                <button
                  key={r}
                  onClick={() =>
                    setUser((prev) => ({
                      ...prev,
                      receiptPref: r.toLowerCase(),
                    }))
                  }
                  className={`focus-ring profile-pill ${user.receiptPref === r.toLowerCase() ? "profile-pill-active" : "profile-pill-inactive"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="card-base profile-danger-card">
            <h4 className="profile-danger-title">Danger Zone</h4>
            <p className="profile-danger-copy">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button className="focus-ring profile-danger-btn">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
