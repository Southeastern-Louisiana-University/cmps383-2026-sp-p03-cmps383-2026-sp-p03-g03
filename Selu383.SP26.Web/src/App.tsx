import { AppProvider } from "./api/context-providers/app-context";
import { Router } from "./navigation/router";

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
