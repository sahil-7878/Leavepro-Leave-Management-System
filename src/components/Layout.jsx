import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
const Layout = () => (
  <div className="d-flex app-shell">
    <Sidebar />
    <div className="flex-grow-1 d-flex flex-column main-area">
      <Header />
      <div className="p-4 flex-grow-1 content-area"><Outlet /></div>
    </div>
  </div>
);
export default Layout;
