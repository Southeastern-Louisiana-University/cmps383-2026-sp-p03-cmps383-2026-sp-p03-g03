import { useState } from "react";
import { T, LOGO, getCat, MENU } from "../components/tokens";
import { Ic, ItemIcon } from "../components/icons";
import { LoyaltyCard } from "../components/loyalty-card";
import { useAppContext } from "../components/app-context";

const ORDER_HISTORY = [
  {
    id: "CL-00847",
    date: "Mar 21, 2026",
    items: ["Iced Latte", "Downtowner"],
    total: 16.25,
    status: "Completed",
  },
  {
    id: "CL-00831",
    date: "Mar 18, 2026",
    items: ["Supernova"],
    total: 7.95,
    status: "Completed",
  },
  {
    id: "CL-00798",
    date: "Mar 12, 2026",
    items: ["Roaring Frappe", "The Classic"],
    total: 11.45,
    status: "Completed",
  },
  {
    id: "CL-00756",
    date: "Mar 5, 2026",
    items: ["Mannino Honey Crepe", "Iced Latte"],
    total: 15.5,
    status: "Completed",
  },
];

const FAVORITE_ITEMS = [
  MENU.Drinks[0],
  MENU["Sweet Crepes"][1],
  MENU.Bagels[0],
];

type ProfileTab = "overview" | "orders" | "favorites" | "settings";

export function ProfilePage() {
  const { user, setUser, logout, setSel, setQty, setNote } = useAppContext();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    phone: user.phone,
    birthday: user.birthday,
  });

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
      ? "cl-profile-tier-badge-gold"
      : user.tier === "Silver"
        ? "cl-profile-tier-badge-silver"
        : "cl-profile-tier-badge-bronze";

  return (
    <div className="cl-profile-page">
      <section className="cl-card-base cl-profile-hero-card">
        <img src={LOGO} alt="" className="cl-profile-hero-logo" />

        <div className="cl-profile-avatar-wrap">
          <span className="cl-profile-avatar-letter">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="cl-profile-flex-1">
          <div className="cl-profile-name-row">
            <h1 className="cl-profile-name">{user.name}</h1>
            <span className={`cl-profile-tier-badge ${tierClass}`}>
              {user.tier} Member
            </span>
          </div>
          <p className="cl-profile-meta">
            {user.email} &nbsp;·&nbsp; Member since {user.memberSince}
          </p>
        </div>

        <button
          onClick={logout}
          className="cl-btn-outline cl-focus-ring cl-btn-outline-base cl-profile-signout"
        >
          <Ic name="logout" size={16} color={T.mocha} />
          Sign Out
        </button>
      </section>

      <div className="cl-profile-tabs">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setActiveTab(t.k)}
            className={`cl-focus-ring cl-profile-tab ${activeTab === t.k ? "cl-profile-tab-active" : "cl-profile-tab-inactive"}`}
          >
            <Ic
              name={t.i}
              size={16}
              color={activeTab === t.k ? T.green : T.caramel}
            />
            {t.l}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="cl-profile-overview-grid">
          <div>
            <div className="cl-card-base cl-profile-info-card">
              <div className="cl-profile-card-header-row">
                <h3 className="cl-profile-section-title">
                  Personal Information
                </h3>
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
                    className="cl-focus-ring cl-profile-edit-btn"
                  >
                    <Ic name="edit" size={14} color={T.green} />
                    Edit
                  </button>
                ) : (
                  <div className="cl-profile-edit-actions">
                    <button
                      onClick={() => setEditing(false)}
                      className="cl-focus-ring cl-btn-outline-base cl-profile-mini-btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="cl-btn-primary cl-focus-ring cl-btn-primary-base cl-profile-mini-btn-primary"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {editing ? (
                <div className="cl-profile-edit-grid">
                  <div className="cl-profile-col-full">
                    <label className="cl-label-base">Full Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="cl-input-base"
                    />
                  </div>
                  <div>
                    <label className="cl-label-base">Phone</label>
                    <input
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="cl-input-base"
                    />
                  </div>
                  <div>
                    <label className="cl-label-base">Birthday</label>
                    <input
                      type="date"
                      value={editForm.birthday}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, birthday: e.target.value }))
                      }
                      className="cl-input-base"
                    />
                  </div>
                </div>
              ) : (
                <div className="cl-profile-info-grid">
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
                      className={`cl-profile-info-row ${i < arr.length - 2 ? "cl-profile-info-row-divided" : ""}`}
                    >
                      <div className="cl-profile-info-icon-wrap">
                        <Ic name={f.icon} size={16} color={T.green} />
                      </div>
                      <div>
                        <p className="cl-profile-info-label">{f.label}</p>
                        <p className="cl-profile-info-value">{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cl-card-base cl-profile-payment-card">
              <h3 className="cl-profile-section-title cl-profile-title-mb20">
                Payment Methods
              </h3>
              <div className="cl-card-base cl-profile-visa-card">
                <div className="cl-profile-visa-logo-wrap">
                  <span className="cl-profile-visa-logo-text">VISA</span>
                </div>
                <div className="cl-profile-flex-1">
                  <p className="cl-profile-visa-primary">Visa •••• 4242</p>
                  <p className="cl-profile-visa-secondary">Expires 12/27</p>
                </div>
                <span className="cl-profile-default-badge">Default</span>
              </div>
              <button className="cl-focus-ring cl-profile-add-payment-btn">
                <Ic name="plus" size={16} color={T.caramel} />
                Add payment method
              </button>
            </div>
          </div>

          <div>
            <LoyaltyCard user={user} />

            <div className="cl-card-base cl-profile-stats-card">
              <h4 className="cl-profile-section-title cl-profile-title-mb20">
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
                  className={`cl-profile-stats-row ${i < arr.length - 1 ? "cl-profile-stats-row-divided" : ""}`}
                >
                  <span className="cl-profile-stats-label">{s.l}</span>
                  <span className="cl-profile-stats-value">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          <div className="cl-profile-block-header">
            <h2 className="cl-profile-block-title">Order History</h2>
            <p className="cl-profile-block-copy">
              Your recent orders at Caffeinated Lions.
            </p>
          </div>
          <div className="cl-profile-order-list">
            {ORDER_HISTORY.map((order) => (
              <div
                key={order.id}
                className="cl-card-base cl-card-hover cl-profile-order-card"
              >
                <div className="cl-profile-order-icon-wrap">
                  <Ic name="menu" size={22} color={T.green} />
                </div>
                <div className="cl-profile-flex-1">
                  <div className="cl-profile-order-head">
                    <h4 className="cl-profile-order-id">{order.id}</h4>
                    <span className="cl-profile-order-date">{order.date}</span>
                  </div>
                  <p className="cl-profile-order-items">
                    {order.items.join(", ")}
                  </p>
                </div>
                <div className="cl-profile-order-right">
                  <p className="cl-profile-order-total">
                    ${order.total.toFixed(2)}
                  </p>
                  <span className="cl-profile-order-status">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "favorites" && (
        <div>
          <div className="cl-profile-block-header">
            <h2 className="cl-profile-block-title">Your Favorites</h2>
            <p className="cl-profile-block-copy">
              Items you've saved for quick reordering.
            </p>
          </div>
          <div className="cl-profile-favorites-grid">
            {FAVORITE_ITEMS.map((item) => (
              <div
                key={item.id}
                className="cl-card-base cl-card-hover cl-profile-fav-card"
                onClick={() => {
                  setSel(item);
                  setQty(1);
                  setNote("");
                }}
              >
                <button className="cl-profile-fav-heart-btn">
                  <Ic name="heart" size={18} color="#E53E3E" />
                </button>
                <ItemIcon cat={getCat(item.id)} size={56} />
                <h4 className="cl-profile-fav-title">{item.name}</h4>
                <p className="cl-profile-fav-kicker">{getCat(item.id)}</p>
                <p className="cl-profile-fav-copy">{item.desc}</p>
                <div className="cl-profile-fav-footer">
                  <span className="cl-profile-fav-price">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="cl-profile-fav-cta">Order →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="cl-profile-settings-wrap">
          <div className="cl-profile-block-header">
            <h2 className="cl-profile-block-title">Preferences</h2>
            <p className="cl-profile-block-copy">
              Manage your ordering preferences and notifications.
            </p>
          </div>

          <div className="cl-card-base cl-profile-setting-card">
            <div className="cl-profile-setting-head">
              <div className="cl-profile-setting-icon-wrap">
                <Ic name="mappin" size={16} color={T.green} />
              </div>
              <h4 className="cl-profile-setting-title">Default Location</h4>
            </div>
            <div className="cl-profile-pill-row cl-profile-pill-row-wrap">
              {["Downtown", "Midtown", "University"].map((loc) => (
                <button
                  key={loc}
                  onClick={() =>
                    setUser((prev) => ({ ...prev, defaultLocation: loc }))
                  }
                  className={`cl-focus-ring cl-profile-pill ${user.defaultLocation === loc ? "cl-profile-pill-active" : "cl-profile-pill-inactive"}`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="cl-card-base cl-profile-setting-card">
            <div className="cl-profile-setting-head">
              <div className="cl-profile-setting-icon-wrap">
                <Ic name="cart" size={16} color={T.green} />
              </div>
              <h4 className="cl-profile-setting-title">Default Order Type</h4>
            </div>
            <div className="cl-profile-pill-row">
              {(["Pickup", "Drive-Thru"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setUser((prev) => ({ ...prev, defaultOrderType: type }))
                  }
                  className={`cl-focus-ring cl-profile-pill cl-profile-pill-wide ${user.defaultOrderType === type ? "cl-profile-pill-active" : "cl-profile-pill-inactive"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="cl-card-base cl-profile-setting-card">
            <div className="cl-profile-setting-head">
              <div className="cl-profile-setting-icon-wrap">
                <Ic name="mail" size={16} color={T.green} />
              </div>
              <h4 className="cl-profile-setting-title">Receipt Preference</h4>
            </div>
            <div className="cl-profile-pill-row cl-profile-pill-row-wrap">
              {["Email", "Text", "Paper", "None"].map((r) => (
                <button
                  key={r}
                  onClick={() =>
                    setUser((prev) => ({
                      ...prev,
                      receiptPref: r.toLowerCase(),
                    }))
                  }
                  className={`cl-focus-ring cl-profile-pill ${user.receiptPref === r.toLowerCase() ? "cl-profile-pill-active" : "cl-profile-pill-inactive"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="cl-card-base cl-profile-danger-card">
            <h4 className="cl-profile-danger-title">Danger Zone</h4>
            <p className="cl-profile-danger-copy">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button className="cl-focus-ring cl-profile-danger-btn">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
