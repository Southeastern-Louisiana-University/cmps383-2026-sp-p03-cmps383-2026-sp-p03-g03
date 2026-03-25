import { T } from "./components/tokens";
import { TopNavbar } from "./components/top-navbar";
import { BackgroundArt } from "./components/background-art";
import { Footer } from "./components/footer";
import { AppProvider, useAppContext } from "./components/app-context";
import { ItemDialog, CheckoutDialog, SuccessDialog } from "./components/dialogs";
import { DashboardPage } from "./pages/dashboard";
import { MenuPage } from "./pages/menu";
import { CartPage } from "./pages/cart";
import { ReservationPage } from "./pages/reservations";
import { AuthPage } from "./pages/auth";
import { ProfilePage } from "./pages/profile";

function AppLayout() {
  const { tab, setTab, count, isLoggedIn } = useAppContext();

  const effectiveTab = (!isLoggedIn && (tab === "profile")) ? "auth" : tab;

  const pages: Record<string, React.JSX.Element> = {
    home: <DashboardPage />,
    order: <MenuPage />,
    cart: <CartPage />,
    reserve: <ReservationPage />,
    auth: <AuthPage />,
    profile: <ProfilePage />,
  };

  const isAuthPage = effectiveTab === "auth";

  return (
    <div style={{ fontFamily: T.font, color: T.darkBrew, minHeight: "100vh", background: T.cream, position: "relative" }}>
      <BackgroundArt />
      <TopNavbar tab={effectiveTab} setTab={setTab} cartCount={count} />
      {isAuthPage ? (
        <main style={{ position: "relative", zIndex: 1 }}>
          {pages[effectiveTab]}
        </main>
      ) : (
        <main style={{ position: "relative", zIndex: 1, padding: "48px 48px 0", maxWidth: 1320, margin: "0 auto" }}>
          {pages[effectiveTab]}
        </main>
      )}
      {!isAuthPage && <Footer setTab={setTab} />}
      <ItemDialog />
      <CheckoutDialog />
      <SuccessDialog />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
