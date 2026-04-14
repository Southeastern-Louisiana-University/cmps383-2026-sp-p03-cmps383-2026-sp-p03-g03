import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, MenuItem, UserProfile } from "../dto-interfaces";

interface AppContext {
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
  authReady: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<{ ok: boolean; error?: string }>;
}

const AppContext = createContext<AppContext>(null!);

export const useAppContext = () => useContext(AppContext);

const EMPTY_USER: UserProfile = {
  name: "",
  email: "",
  phone: "",
  birthday: "",
  points: 0,
  memberSince: "",
  tier: "Bronze",
  defaultLocation: "",
  defaultOrderType: "Pickup",
  receiptPref: "email",
};

type AuthResult = { ok: boolean; error?: string };

interface ApiUserDto {
  id: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  roles: string[];
  loyaltyPoints: number;
}

function toUserProfile(dto: ApiUserDto): UserProfile {
  const displayName = dto.displayName?.trim();
  const firstName = dto.firstName?.trim();
  const lastName = dto.lastName?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const points = dto.loyaltyPoints ?? 0;
  const tier: UserProfile["tier"] =
    points >= 500 ? "Gold" : points >= 150 ? "Silver" : "Bronze";

  return {
    name: displayName || fullName || dto.userName,
    email: dto.email ?? "",
    phone: dto.phoneNumber ?? "",
    birthday: "",
    points,
    memberSince: "",
    tier,
    defaultLocation: "",
    defaultOrderType: "Pickup",
    receiptPref: "email",
  };
}

function parseApiError(status: number, payload: unknown): string {
  if (payload && typeof payload === "object") {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }

    const errors = (payload as { errors?: unknown }).errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const firstError = errors.find((value) => typeof value === "string");
      if (typeof firstError === "string" && firstError.trim().length > 0) {
        return firstError;
      }
    }
  }

  return `Request failed with status ${status}`;
}

async function readPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function requestApi(
  url: string,
  init: RequestInit,
): Promise<{ response: Response; payload: unknown }> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
  });

  const payload = await readPayload(response);
  return { response, payload };
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sel, setSel] = useState<MenuItem | null>(null);
  const [showCO, setShowCO] = useState(false);
  const [showOK, setShowOK] = useState(false);
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const [rcpt, setRcpt] = useState("email");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<UserProfile>(EMPTY_USER);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const setSignedOutState = () => {
    setIsLoggedIn(false);
    setUser(EMPTY_USER);
  };

  const setSignedInState = (payload: ApiUserDto) => {
    setUser(toUserProfile(payload));
    setIsLoggedIn(true);
  };

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

  useEffect(() => {
    const controller = new AbortController();

    const loadCurrentUser = async () => {
      try {
        const { response, payload } = await requestApi(
          "/api/authentication/me",
          {
            method: "GET",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setSignedOutState();
          return;
        }

        setSignedInState(payload as ApiUserDto);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setSignedOutState();
      } finally {
        if (!controller.signal.aborted) {
          setAuthReady(true);
        }
      }
    };

    loadCurrentUser();

    return () => {
      controller.abort();
    };
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<AuthResult> => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      return { ok: false, error: "Please fill in all fields." };
    }

    try {
      const { response, payload } = await requestApi(
        "/api/authentication/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: trimmedUsername, password }),
        },
      );

      if (!response.ok) {
        return { ok: false, error: parseApiError(response.status, payload) };
      }

      setSignedInState(payload as ApiUserDto);
      return { ok: true };
    } catch {
      return { ok: false, error: "Unable to reach the server right now." };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    const trimName = name.trim();
    const trimEmail = email.trim();
    if (!trimName || !trimEmail || !password) {
      return { ok: false, error: "Please fill in all fields." };
    }

    try {
      const { response, payload } = await requestApi("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: trimEmail,
          password,
          displayName: trimName,
          email: trimEmail,
          roles: ["Customer"],
        }),
      });

      if (!response.ok) {
        return { ok: false, error: parseApiError(response.status, payload) };
      }

      return login(trimEmail, password);
    } catch {
      return { ok: false, error: "Unable to reach the server right now." };
    }
  };

  const logout = async (): Promise<AuthResult> => {
    try {
      await requestApi("/api/authentication/logout", { method: "POST" });
    } catch {
      setSignedOutState();
      setCart([]);
      return {
        ok: false,
        error: "Signed out locally, but the server could not be reached.",
      };
    }

    setSignedOutState();
    setCart([]);
    return { ok: true };
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
        authReady,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
