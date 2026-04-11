import { createContext, useContext, useState, type ReactNode } from "react";
import type { CartItem, MenuItem } from "../interfaces";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  points: number;
  memberSince: string;
  tier: "Bronze" | "Silver" | "Gold";
  defaultLocation: string;
  defaultOrderType: "Pickup" | "Drive-Thru";
  receiptPref: string;
}

interface AppContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  sel: MenuItem | null;
  setSel: React.Dispatch<React.SetStateAction<MenuItem | null>>;
  showCO: boolean;
  setShowCO: React.Dispatch<React.SetStateAction<boolean>>;
  showOK: boolean;
  setShowOK: React.Dispatch<React.SetStateAction<boolean>>;
  note: string;
  setNote: React.Dispatch<React.SetStateAction<string>>;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
  rcpt: string;
  setRcpt: React.Dispatch<React.SetStateAction<string>>;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  total: number;
  count: number;
  addToCart: () => void;
  isLoggedIn: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (
    name: string,
    email: string,
    password: string,
  ) => { ok: boolean; error?: string };
  logout: () => void;
}

const AppContext = createContext<AppContextType>(null!);

export const useAppContext = () => useContext(AppContext);

const DEFAULT_USER: UserProfile = {
  name: "Bob",
  email: "bob@email.com",
  phone: "(555) 123-4567",
  birthday: "1990-06-15",
  points: 150,
  memberSince: "January 2024",
  tier: "Silver",
  defaultLocation: "Downtown",
  defaultOrderType: "Pickup",
  receiptPref: "email",
};

const accounts: Map<string, { name: string; password: string }> = new Map();
accounts.set("bob@email.com", { name: "Bob", password: "password123" });

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sel, setSel] = useState<MenuItem | null>(null);
  const [showCO, setShowCO] = useState(false);
  const [showOK, setShowOK] = useState(false);
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const [rcpt, setRcpt] = useState("email");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = () => {
    if (!sel) return;
    const ex = cart.find((c) => c.id === sel.id && c.note === note);
    if (ex)
      setCart(cart.map((c) => (c === ex ? { ...c, qty: c.qty + qty } : c)));
    else setCart([...cart, { ...sel, qty, note }]);
    setSel(null);
    setNote("");
    setQty(1);
  };

  const login = (
    email: string,
    password: string,
  ): { ok: boolean; error?: string } => {
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail || !password)
      return { ok: false, error: "Please fill in all fields." };
    const acct = accounts.get(trimEmail);
    if (!acct) return { ok: false, error: "No account found with this email." };
    if (acct.password !== password)
      return { ok: false, error: "Incorrect password." };
    setUser({ ...DEFAULT_USER, name: acct.name, email: trimEmail });
    setIsLoggedIn(true);
    return { ok: true };
  };

  const signup = (
    name: string,
    email: string,
    password: string,
  ): { ok: boolean; error?: string } => {
    const trimName = name.trim();
    const trimEmail = email.trim().toLowerCase();
    if (!trimName || !trimEmail || !password)
      return { ok: false, error: "Please fill in all fields." };
    if (password.length < 6)
      return { ok: false, error: "Password must be at least 6 characters." };
    if (accounts.has(trimEmail))
      return { ok: false, error: "An account with this email already exists." };
    accounts.set(trimEmail, { name: trimName, password });
    setUser({
      ...DEFAULT_USER,
      name: trimName,
      email: trimEmail,
      points: 0,
      memberSince: "March 2026",
      tier: "Bronze",
    });
    setIsLoggedIn(true);
    return { ok: true };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        setCart,
        sel,
        setSel,
        showCO,
        setShowCO,
        showOK,
        setShowOK,
        note,
        setNote,
        qty,
        setQty,
        rcpt,
        setRcpt,
        user,
        setUser,
        total,
        count,
        addToCart,
        isLoggedIn,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
