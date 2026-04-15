import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../api/context-providers/app-context";
import { requestApi } from "../../api/context-providers/app-context";
import { Ic } from "../../components/icons";
import { Dialog } from "../../components/dialog";
import { Tokens } from "../../styles/tokens";
import { ManagerDashboard } from "../manager/manager-dashboard";
import { listAdminUsers, type AdminUser } from "../../api/staff";
import "./admin-dashboard.css";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface LocationDto {
  id: number;
  name: string;
}

const ALL_ROLES = ["Admin", "Manager", "Staff", "Customer"] as const;

export function AdminDashboard() {
  const { user } = useAppContext();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");

  const fetchUsers = useCallback(async () => {
    setError("");
    try {
      const data = await listAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter) {
      list = list.filter((u) => u.roles.includes(roleFilter));
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.userName.toLowerCase().includes(q) ||
          (u.displayName ?? "").toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, roleFilter, search]);

  const handleCreated = (userName: string) => {
    setShowCreate(false);
    setLoading(true);
    fetchUsers();
    setToast(`User '${userName}' created.`);
  };

  return (
    <div className="adm-page">
      <div className="adm-header">
        <p className="adm-kicker">Admin Dashboard</p>
        <h1 className="adm-title">Admin Dashboard</h1>
        <p className="adm-subtitle">
          Signed in as {user.name} &middot; Admin
        </p>
      </div>

      <ManagerDashboard embedded />

      <div className="adm-divider" />

      <div className="adm-section-bar">
        <h2 className="adm-section-title">Users</h2>
      </div>

      <div className="adm-toolbar">
        <button className="adm-create-btn" onClick={() => setShowCreate(true)}>
          Create User
        </button>
        <div className="adm-toolbar-role-filter">
          <select
            className="select-base"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All roles</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="adm-toolbar-search">
          <input
            className="input-base"
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {toast && <div className="adm-toast">{toast}</div>}

      {loading ? (
        <div className="adm-loading">
          <span className="adm-spinner" />
          <p className="adm-loading-text">Loading users...</p>
        </div>
      ) : error ? (
        <div className="card-base adm-error-card">
          <p className="adm-error-text">{error}</p>
          <button
            className="adm-error-retry"
            onClick={() => {
              setLoading(true);
              setError("");
              fetchUsers();
            }}
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="adm-empty">
          <p className="adm-empty-text">No users match those filters.</p>
        </div>
      ) : (
        <div className="card-base" style={{ overflow: "auto" }}>
          <table className="adm-users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Display Name</th>
                <th>Email</th>
                <th className="adm-col-roles">Roles</th>
                <th>Points</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.userName}</td>
                  <td>{u.displayName ?? "\u2014"}</td>
                  <td>{u.email ?? "\u2014"}</td>
                  <td className="adm-col-roles">
                    {u.roles.map((r) => (
                      <span key={r} className="adm-role-pill">
                        {r}
                      </span>
                    ))}
                  </td>
                  <td className="adm-points">{u.loyaltyPoints}</td>
                  <td>{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateUserDialog
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

function CreateUserDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (userName: string) => void;
}) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roles, setRoles] = useState<Set<string>>(new Set());
  const [locationId, setLocationId] = useState<number | null>(null);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [dlgError, setDlgError] = useState("");

  const needsLocation = roles.has("Staff");

  useEffect(() => {
    if (!needsLocation) return;
    if (locations.length > 0) return; // already loaded
    let cancelled = false;
    (async () => {
      try {
        const { response, payload } = await requestApi("/api/locations", {
          method: "GET",
        });
        if (response.ok && !cancelled) {
          setLocations(payload as LocationDto[]);
        }
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [needsLocation, locations.length]);

  const toggleRole = (role: string) => {
    setRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) {
        next.delete(role);
        if (role === "Staff") setLocationId(null);
      } else {
        next.add(role);
      }
      return next;
    });
  };

  const validate = (): string | null => {
    if (!userName.trim()) return "Username is required.";
    if (!password) return "Password is required.";
    if (password.length < 8)
      return "Password must be at least 8 characters.";
    if (roles.size === 0) return "At least one role is required.";
    if (needsLocation && !locationId)
      return "Location is required for Staff users.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setDlgError(err);
      return;
    }
    setBusy(true);
    setDlgError("");
    try {
      const { response, payload } = await requestApi("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userName.trim(),
          password,
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          displayName: displayName.trim() || null,
          email: email.trim() || null,
          phoneNumber: phone.trim() || null,
          roles: [...roles],
          locationId: needsLocation ? locationId : null,
        }),
      });

      if (!response.ok) {
        const p = payload as {
          message?: string;
          errors?: string[];
        };
        const msg =
          (typeof p?.message === "string" && p.message.trim()) ||
          (Array.isArray(p?.errors) &&
            p.errors.find((e) => typeof e === "string" && e.trim())) ||
          `Request failed (HTTP ${response.status})`;
        setDlgError(typeof msg === "string" ? msg : String(msg));
        setBusy(false);
        return;
      }

      onCreated(userName.trim());
    } catch {
      setDlgError("Unable to reach the server right now.");
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} width={560}>
      <div className="adm-create-body">
        <h3 className="adm-create-header">Create User</h3>
        <p className="adm-create-sub">
          Add a new staff member or customer account.
        </p>


        <div className="adm-form-row">
          <label className="label-base">Username *</label>
          <input
            className="input-base"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="username"
          />
        </div>


        <div className="adm-form-row">
          <label className="label-base">Password *</label>
          <div className="adm-password-wrap">
            <input
              className="input-base"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              className="adm-eye-btn"
              onClick={() => setShowPw(!showPw)}
            >
              <Ic
                name={showPw ? "eyeoff" : "eye"}
                size={18}
                color={Tokens.caramel}
              />
            </button>
          </div>
        </div>


        <div className="adm-form-row">
          <label className="label-base">Display Name</label>
          <input
            className="input-base"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
          />
        </div>


        <div className="adm-form-row-2col">
          <div>
            <label className="label-base">First Name</label>
            <input
              className="input-base"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First"
            />
          </div>
          <div>
            <label className="label-base">Last Name</label>
            <input
              className="input-base"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last"
            />
          </div>
        </div>


        <div className="adm-form-row-2col">
          <div>
            <label className="label-base">Email</label>
            <input
              className="input-base"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@email.com"
            />
          </div>
          <div>
            <label className="label-base">Phone</label>
            <input
              className="input-base"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>


        <div className="adm-form-row">
          <label className="label-base">Roles *</label>
          <div className="adm-roles-group">
            {ALL_ROLES.map((r) => (
              <label key={r} className="adm-role-check">
                <input
                  type="checkbox"
                  checked={roles.has(r)}
                  onChange={() => toggleRole(r)}
                />
                {r}
              </label>
            ))}
          </div>
        </div>


        {needsLocation && (
          <div className="adm-form-row">
            <label className="label-base">Location *</label>
            <select
              className="select-base"
              value={locationId ?? ""}
              onChange={(e) =>
                setLocationId(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            >
              <option value="">Select a location...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {dlgError && <div className="adm-create-error">{dlgError}</div>}

        <div className="adm-create-actions">
          <button
            className="btn-outline-base btn-outline focus-ring"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="btn-primary-base btn-primary focus-ring"
            onClick={handleSubmit}
            disabled={busy}
          >
            {busy ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
