import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import ChatWidget from "./ChatWidget";

const Layout = () => (
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
