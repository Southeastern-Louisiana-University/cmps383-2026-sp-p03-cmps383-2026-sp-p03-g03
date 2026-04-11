import { AppProvider } from "./api/contexts/app-context";
import { Router } from "./navigation/router";

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
