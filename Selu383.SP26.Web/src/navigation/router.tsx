import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { DashboardPage } from "../pages/landing/dashboard";
import { MenuPage } from "../pages/menu/menu";
import { CartPage } from "../pages/cart/cart";
import { OrdersPage } from "../pages/orders/orders";
import { ReservationPage } from "../pages/reservations/reservations";
import { AuthPage } from "../pages/login/auth";
import { ProfilePage } from "../pages/user/profile";
import { Navbar } from "./navbar";
import { BackgroundArt } from "../components/background-art";
import { Footer } from "../components/footer";
import {
  ItemDialog,
  CheckoutDialog,
  SuccessDialog,
} from "../components/dialogs";
import { useAppContext } from "../contexts/app-context";
import { APP_ROUTES, normalizeRoute } from "./routes";

function AppLayout() {
  const { count } = useAppContext();
  const { pathname } = useLocation();
  const isAuthPage = normalizeRoute(pathname) === APP_ROUTES.auth;

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
    return <Navigate to={APP_ROUTES.auth} replace />;
  }

  return <ProfilePage />;
}

function ProtectedOrdersRoute() {
  const { isLoggedIn } = useAppContext();

  if (!isLoggedIn) {
    return <Navigate to={APP_ROUTES.auth} replace />;
  }

  return <OrdersPage />;
}

export function Router() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path={APP_ROUTES.menu.slice(1)} element={<MenuPage />} />
        <Route
          path="order"
          element={<Navigate to={APP_ROUTES.menu} replace />}
        />
        <Route
          path={APP_ROUTES.orders.slice(1)}
          element={<ProtectedOrdersRoute />}
        />
        <Route path={APP_ROUTES.cart.slice(1)} element={<CartPage />} />
        <Route
          path={APP_ROUTES.reservations.slice(1)}
          element={<ReservationPage />}
        />
        <Route
          path="reserve"
          element={<Navigate to={APP_ROUTES.reservations} replace />}
        />
        <Route path={APP_ROUTES.auth.slice(1)} element={<AuthPage />} />
        <Route
          path={APP_ROUTES.profile.slice(1)}
          element={<ProtectedProfileRoute />}
        />
        <Route path="*" element={<Navigate to={APP_ROUTES.home} replace />} />
      </Route>
    </Routes>
  );
}
