import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { DashboardPage } from "../pages/dashboard/dashboard";
import { MenuPage } from "../pages/menu/menu";
import { CartPage } from "../pages/cart/cart";
import { OrdersPage } from "../pages/orders/orders";
import { ReservationPage } from "../pages/reservations/reservations";
import { AuthPage } from "../pages/login/auth";
import { ProfilePage } from "../pages/user/profile";
import { StaffDashboard } from "../pages/staff/staff-dashboard";
import { ManagerDashboard } from "../pages/manager/manager-dashboard";
import { AdminDashboard } from "../pages/admin/admin-dashboard";
import { Navbar } from "./navbar";
import { ProtectedRoute } from "./protected-route";
import { BackgroundArt } from "../components/background-art";
import { Footer } from "../components/footer";
import {
  ItemDialog,
  CheckoutDialog,
  SuccessDialog,
  LocationChangeDialog,
} from "../components/dialogs";
import { useAppContext } from "../api/context-providers/app-context";
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
      <LocationChangeDialog />
    </div>
  );
}

function ProtectedProfileRoute() {
  const { isLoggedIn, authReady } = useAppContext();
  const location = useLocation();

  if (!authReady) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to={APP_ROUTES.auth}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <ProfilePage />;
}

function ProtectedOrdersRoute() {
  const { isLoggedIn, authReady } = useAppContext();
  const location = useLocation();

  if (!authReady) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to={APP_ROUTES.auth}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
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
        <Route
          path="staff"
          element={
            <ProtectedRoute allowedRoles={["Staff", "Manager", "Admin"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="manager"
          element={
            <ProtectedRoute allowedRoles={["Manager", "Admin"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={APP_ROUTES.home} replace />} />
      </Route>
    </Routes>
  );
}
