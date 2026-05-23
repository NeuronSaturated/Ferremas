import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import ChatWidget from "./ChatWidget";

const Layout = () => (
  // Aqui se arma la estructura comun: header, contenido, chatbot y footer.
  <div className="flex min-h-screen flex-col">
    <SiteHeader />
    <main className="flex-1">
      <Outlet />
    </main>
    <ChatWidget />
    <SiteFooter />
  </div>
);

export default Layout;
