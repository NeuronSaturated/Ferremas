import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Aqui React monta toda la aplicacion dentro del div #root declarado en index.html.
createRoot(document.getElementById("root")!).render(<App />);
