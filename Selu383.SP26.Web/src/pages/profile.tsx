import { useState } from "react";
import { T, LOGO, card, btnP, btnO, lbl, inp, getCat, MENU } from "../components/tokens";
import { Ic, ItemIcon } from "../components/icons";
import { LoyaltyCard } from "../components/loyalty-card";
import { useAppContext } from "../components/app-context";

const ORDER_HISTORY = [
  { id: "CL-00847", date: "Mar 21, 2026", items: ["Iced Latte", "Downtowner"], total: 16.25, status: "Completed" },
  { id: "CL-00831", date: "Mar 18, 2026", items: ["Supernova"], total: 7.95, status: "Completed" },
  { id: "CL-00798", date: "Mar 12, 2026", items: ["Roaring Frappe", "The Classic"], total: 11.45, status: "Completed" },
  { id: "CL-00756", date: "Mar 5, 2026", items: ["Mannino Honey Crepe", "Iced Latte"], total: 15.50, status: "Completed" },
];

const FAVORITE_ITEMS = [MENU.Drinks[0], MENU["Sweet Crepes"][1], MENU.Bagels[0]];

type ProfileTab = "overview" | "orders" | "favorites" | "settings";

export function ProfilePage() {
  const { user, setUser, logout, setSel, setQty, setNote } = useAppContext();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user.name, phone: user.phone, birthday: user.birthday });

  const handleSave = () => {
    setUser(prev => ({ ...prev, name: editForm.name, phone: editForm.phone, birthday: editForm.birthday }));
    setEditing(false);
  };

  const tabs: { k: ProfileTab; l: string; i: string }[] = [
    { k: "overview", l: "Overview", i: "user" },
    { k: "orders", l: "Order History", i: "clock" },
    { k: "favorites", l: "Favorites", i: "heart" },
    { k: "settings", l: "Settings", i: "settings" },
  ];

  const tierColor = user.tier === "Gold" ? "#D4A017" : user.tier === "Silver" ? "#8B8B8B" : "#CD7F32";

  return (
    <div>
      <section style={{
        ...card(), padding: "40px 48px", marginBottom: 32,
        display: "flex", alignItems: "center", gap: 32,
        position: "relative", overflow: "hidden",
      }}>
        <img src={LOGO} alt="" style={{
          position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)",
          width: 140, height: 140, objectFit: "contain", opacity: 0.04,
        }} />

        <div style={{
          width: 96, height: 96, borderRadius: "50%", flexShrink: 0,
          background: T.darkBrew,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `3px solid ${T.sand}`,
        }}>
          <span style={{
            fontFamily: T.fontDisplay, fontSize: 36, fontWeight: 700, color: T.white,
          }}>
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <h1 style={{
              fontFamily: T.fontDisplay, fontSize: 32, fontWeight: 700,
              color: T.darkBrew, margin: 0, lineHeight: 1.1,
            }}>{user.name}</h1>
            <span style={{
              fontFamily: T.font, fontSize: 11, fontWeight: 600,
              letterSpacing: "1px", textTransform: "uppercase",
              padding: "4px 12px", borderRadius: 20,
              background: `${tierColor}18`, color: tierColor, border: `1px solid ${tierColor}30`,
            }}>{user.tier} Member</span>
          </div>
          <p style={{ fontFamily: T.font, fontSize: 15, color: T.mocha, margin: "4px 0 0" }}>
            {user.email} &nbsp;·&nbsp; Member since {user.memberSince}
          </p>
        </div>

        <button
          onClick={logout}
          className="cl-btn-outline cl-focus-ring"
          style={{
            ...btnO, display: "flex", alignItems: "center", gap: 8,
            color: T.mocha, borderColor: T.warmTan,
          }}
        >
          <Ic name="logout" size={16} color={T.mocha} />
          Sign Out
        </button>
      </section>

      <div style={{ display: "flex", gap: 0, marginBottom: 32, borderBottom: `1px solid ${T.sand}` }}>
        {tabs.map(t => (
          <button
            key={t.k}
            onClick={() => setActiveTab(t.k)}
            className="cl-focus-ring"
            style={{
              padding: "12px 24px", border: "none", background: "none",
              fontFamily: T.font, fontWeight: activeTab === t.k ? 600 : 500, fontSize: 15,
              color: activeTab === t.k ? T.darkBrew : T.mocha,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              borderBottom: activeTab === t.k ? `2px solid ${T.green}` : "2px solid transparent",
              marginBottom: -1, transition: "color 0.2s",
            }}
          >
            <Ic name={t.i} size={16} color={activeTab === t.k ? T.green : T.caramel} />
            {t.l}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
          <div>
            <div style={{ ...card(), padding: "32px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: T.mocha, margin: 0 }}>
                  Personal Information
                </h3>
                {!editing ? (
                  <button
                    onClick={() => { setEditing(true); setEditForm({ name: user.name, phone: user.phone, birthday: user.birthday }); }}
                    className="cl-focus-ring"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.green, padding: 0,
                    }}
                  >
                    <Ic name="edit" size={14} color={T.green} />
                    Edit
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setEditing(false)} className="cl-focus-ring" style={{ ...btnO, padding: "8px 16px", fontSize: 13 }}>Cancel</button>
                    <button onClick={handleSave} className="cl-btn-primary cl-focus-ring" style={{ ...btnP, padding: "8px 20px", fontSize: 13 }}>Save</button>
                  </div>
                )}
              </div>

              {editing ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px" }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={lbl}>Full Name</label>
                    <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Phone</label>
                    <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Birthday</label>
                    <input type="date" value={editForm.birthday} onChange={e => setEditForm(p => ({ ...p, birthday: e.target.value }))} style={inp} />
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  {[
                    { icon: "user", label: "Name", value: user.name },
                    { icon: "mail", label: "Email", value: user.email },
                    { icon: "phone", label: "Phone", value: user.phone },
                    { icon: "cake", label: "Birthday", value: user.birthday ? new Date(user.birthday + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Not set" },
                  ].map((f, i, arr) => (
                    <div key={f.label} style={{
                      padding: "16px 0",
                      borderBottom: i < arr.length - 2 ? `1px solid ${T.sand}` : "none",
                      display: "flex", alignItems: "center", gap: 14,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: T.cream, border: `1px solid ${T.sand}`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Ic name={f.icon} size={16} color={T.green} />
                      </div>
                      <div>
                        <p style={{ fontFamily: T.font, fontSize: 12, color: T.caramel, margin: "0 0 2px", fontWeight: 500 }}>{f.label}</p>
                        <p style={{ fontFamily: T.font, fontSize: 15, color: T.darkBrew, margin: 0, fontWeight: 500 }}>{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ ...card(), padding: "32px" }}>
              <h3 style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: T.mocha, margin: "0 0 20px" }}>
                Payment Methods
              </h3>
              <div style={{
                ...card(), padding: "20px", display: "flex", alignItems: "center", gap: 16,
                border: `1px solid ${T.greenMuted}`,
              }}>
                <div style={{
                  width: 48, height: 32, borderRadius: 6, background: "#1A1F71",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: T.white, fontSize: 10, fontWeight: 700, fontFamily: T.font }}>VISA</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, fontFamily: T.font, color: T.darkBrew }}>Visa •••• 4242</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: T.mocha, fontFamily: T.font }}>Expires 12/27</p>
                </div>
                <span style={{
                  fontFamily: T.font, fontSize: 11, fontWeight: 600,
                  color: T.green, background: T.cream, padding: "4px 10px",
                  borderRadius: 20, border: `1px solid ${T.sand}`,
                }}>Default</span>
              </div>
              <button className="cl-focus-ring" style={{
                background: "none", border: `1px dashed ${T.warmTan}`, borderRadius: T.rSm,
                padding: "16px", width: "100%", marginTop: 12, cursor: "pointer",
                fontFamily: T.font, fontSize: 14, color: T.mocha, fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "border-color 0.2s",
              }}>
                <Ic name="plus" size={16} color={T.caramel} />
                Add payment method
              </button>
            </div>
          </div>

          <div>
            <LoyaltyCard user={user} />

            <div style={{ ...card(), marginTop: 24, padding: "28px" }}>
              <h4 style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: T.mocha, margin: "0 0 20px" }}>
                Quick Stats
              </h4>
              {[
                { l: "Total Orders", v: "24" },
                { l: "This Month", v: "4 orders" },
                { l: "Points Earned", v: "+320 total" },
                { l: "Rewards Redeemed", v: "2" },
              ].map((s, i, arr) => (
                <div key={s.l} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0",
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.sand}` : "none",
                }}>
                  <span style={{ fontSize: 14, color: T.mocha, fontFamily: T.font }}>{s.l}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.darkBrew, fontFamily: T.font }}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, color: T.darkBrew, margin: "0 0 8px" }}>Order History</h2>
            <p style={{ fontFamily: T.font, fontSize: 15, color: T.mocha, margin: 0 }}>Your recent orders at Caffeinated Lions.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ORDER_HISTORY.map(order => (
              <div key={order.id} className="cl-card-hover" style={{
                ...card(), padding: "24px 28px",
                display: "flex", alignItems: "center", gap: 24,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: T.cream, border: `1px solid ${T.sand}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Ic name="menu" size={22} color={T.green} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <h4 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.darkBrew, margin: 0, lineHeight: 1.2 }}>
                      {order.id}
                    </h4>
                    <span style={{ fontFamily: T.font, fontSize: 13, color: T.mocha }}>{order.date}</span>
                  </div>
                  <p style={{ fontFamily: T.font, fontSize: 14, color: T.mocha, margin: 0 }}>
                    {order.items.join(", ")}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.darkBrew, margin: "0 0 4px" }}>
                    ${order.total.toFixed(2)}
                  </p>
                  <span style={{
                    fontFamily: T.font, fontSize: 11, fontWeight: 600, color: T.green,
                    background: T.cream, padding: "3px 10px", borderRadius: 20, border: `1px solid ${T.sand}`,
                  }}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "favorites" && (
        <div>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, color: T.darkBrew, margin: "0 0 8px" }}>Your Favorites</h2>
            <p style={{ fontFamily: T.font, fontSize: 15, color: T.mocha, margin: 0 }}>Items you've saved for quick reordering.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {FAVORITE_ITEMS.map(item => (
              <div
                key={item.id}
                className="cl-card-hover"
                onClick={() => { setSel(item); setQty(1); setNote(""); }}
                style={{ ...card(), cursor: "pointer", padding: "28px", position: "relative" }}
              >
                <button style={{
                  position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer",
                }}>
                  <Ic name="heart" size={18} color="#E53E3E" />
                </button>
                <ItemIcon cat={getCat(item.id)} size={56} />
                <h4 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, color: T.darkBrew, margin: "16px 0 4px", lineHeight: 1.2 }}>
                  {item.name}
                </h4>
                <p style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: T.mocha, margin: "0 0 8px" }}>
                  {getCat(item.id)}
                </p>
                <p style={{ fontFamily: T.font, fontSize: 14, color: T.mocha, lineHeight: 1.5, margin: "0 0 16px" }}>
                  {item.desc}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, color: T.darkBrew }}>${item.price.toFixed(2)}</span>
                  <span style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.green }}>Order →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div style={{ maxWidth: 720 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, color: T.darkBrew, margin: "0 0 8px" }}>Preferences</h2>
            <p style={{ fontFamily: T.font, fontSize: 15, color: T.mocha, margin: 0 }}>Manage your ordering preferences and notifications.</p>
          </div>

          <div style={{ ...card(), padding: "28px 32px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: T.cream, border: `1px solid ${T.sand}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ic name="mappin" size={16} color={T.green} />
              </div>
              <h4 style={{ fontFamily: T.font, fontSize: 15, fontWeight: 600, color: T.darkBrew, margin: 0 }}>Default Location</h4>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Downtown", "Midtown", "University"].map(loc => (
                <button
                  key={loc}
                  onClick={() => setUser(prev => ({ ...prev, defaultLocation: loc }))}
                  className="cl-focus-ring"
                  style={{
                    padding: "10px 20px", borderRadius: T.rSm,
                    border: user.defaultLocation === loc ? `1.5px solid ${T.green}` : `1px solid ${T.warmTan}`,
                    background: user.defaultLocation === loc ? T.cream : T.white,
                    color: user.defaultLocation === loc ? T.green : T.espresso,
                    fontFamily: T.font, fontWeight: 500, fontSize: 14, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >{loc}</button>
              ))}
            </div>
          </div>

          <div style={{ ...card(), padding: "28px 32px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: T.cream, border: `1px solid ${T.sand}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ic name="cart" size={16} color={T.green} />
              </div>
              <h4 style={{ fontFamily: T.font, fontSize: 15, fontWeight: 600, color: T.darkBrew, margin: 0 }}>Default Order Type</h4>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["Pickup", "Drive-Thru"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setUser(prev => ({ ...prev, defaultOrderType: type }))}
                  className="cl-focus-ring"
                  style={{
                    padding: "10px 24px", borderRadius: T.rSm,
                    border: user.defaultOrderType === type ? `1.5px solid ${T.green}` : `1px solid ${T.warmTan}`,
                    background: user.defaultOrderType === type ? T.cream : T.white,
                    color: user.defaultOrderType === type ? T.green : T.espresso,
                    fontFamily: T.font, fontWeight: 500, fontSize: 14, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >{type}</button>
              ))}
            </div>
          </div>

          <div style={{ ...card(), padding: "28px 32px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: T.cream, border: `1px solid ${T.sand}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ic name="mail" size={16} color={T.green} />
              </div>
              <h4 style={{ fontFamily: T.font, fontSize: 15, fontWeight: 600, color: T.darkBrew, margin: 0 }}>Receipt Preference</h4>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Email", "Text", "Paper", "None"].map(r => (
                <button
                  key={r}
                  onClick={() => setUser(prev => ({ ...prev, receiptPref: r.toLowerCase() }))}
                  className="cl-focus-ring"
                  style={{
                    padding: "10px 20px", borderRadius: T.rSm,
                    border: user.receiptPref === r.toLowerCase() ? `1.5px solid ${T.green}` : `1px solid ${T.warmTan}`,
                    background: user.receiptPref === r.toLowerCase() ? T.cream : T.white,
                    color: user.receiptPref === r.toLowerCase() ? T.green : T.espresso,
                    fontFamily: T.font, fontWeight: 500, fontSize: 14, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >{r}</button>
              ))}
            </div>
          </div>

          <div style={{
            ...card(), padding: "28px 32px", marginTop: 32,
            borderColor: "#FED7D7",
          }}>
            <h4 style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#C53030", margin: "0 0 8px" }}>
              Danger Zone
            </h4>
            <p style={{ fontFamily: T.font, fontSize: 14, color: T.mocha, margin: "0 0 16px", lineHeight: 1.5 }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="cl-focus-ring" style={{
              background: "none", border: "1.5px solid #E53E3E", borderRadius: T.rSm,
              padding: "10px 24px", fontFamily: T.font, fontWeight: 600, fontSize: 14,
              color: "#E53E3E", cursor: "pointer", transition: "background 0.2s",
            }}>
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
