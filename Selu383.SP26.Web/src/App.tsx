import { AppProvider } from "./components/app-context";
import { Router } from "./router";

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
