import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CustomizationProvider } from "./components/CustomizationProvider";

createRoot(document.getElementById("root")!).render(
  <CustomizationProvider>
    <App />
  </CustomizationProvider>
);
