import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/landing/dashboard";
import { MenuPage } from "./pages/menu/menu";
import { CartPage } from "./pages/cart/cart";
import { OrdersPage } from "./pages/orders/orders";
import { ReservationPage } from "./pages/reservations/reservations";
import { AuthPage } from "./pages/login/auth";
import { ProfilePage } from "./pages/user/profile";
import { Navbar } from "./components/navbar";
import { BackgroundArt } from "./components/background-art";
import { Footer } from "./components/footer";
import {
  ItemDialog,
  CheckoutDialog,
  SuccessDialog,
} from "./components/dialogs";
import { useAppContext } from "./components/app-context";

function AppLayout() {
  const { count, tab } = useAppContext();
  const isAuthPage = tab === "auth";

  return (
    <div className="app-shell">
      <BackgroundArt />
      <Navbar cartCount={count} />
      {isAuthPage ? (
        <main className="app-main-auth">
          <Outlet />
        </main>
      ) : (
        <main className="app-main">
          <Outlet />
        </main>
      )}
      {!isAuthPage && <Footer />}
      <ItemDialog />
      <CheckoutDialog />
      <SuccessDialog />
    </div>
  );
}

function ProtectedProfileRoute() {
  const { isLoggedIn } = useAppContext();

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return <ProfilePage />;
}

function ProtectedOrdersRoute() {
  const { isLoggedIn } = useAppContext();

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return <OrdersPage />;
}

export function Router() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="order" element={<Navigate to="/menu" replace />} />
        <Route path="orders" element={<ProtectedOrdersRoute />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="reservations" element={<ReservationPage />} />
        <Route
          path="reserve"
          element={<Navigate to="/reservations" replace />}
        />
        <Route path="auth" element={<AuthPage />} />
        <Route path="profile" element={<ProtectedProfileRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
