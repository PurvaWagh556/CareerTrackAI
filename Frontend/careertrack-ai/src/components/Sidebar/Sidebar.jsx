import { NavLink, Link } from "react-router-dom";
import {
  Home,
  Rocket,
} from "lucide-react";
import { IoSparkles } from "react-icons/io5";
import { Code2 } from "lucide-react";
import { VscProjectCompact } from "react-icons/vsc";
import { FiMap } from "react-icons/fi";
import { GoGoal } from "react-icons/go";
import { LuCat } from "react-icons/lu";

import "./sidebar.css";

function Sidebar({ isOpen }) {
  const menu = [
    {
      name: "Dashboard",
      icon: <Home />,
      path: "/",
    },
    {
      name: "Skills",
      icon: <IoSparkles />,
      path: "/skills",
    },
    {
      name: "DSA Tracker",
      icon: <Code2 />,
      path: "/dsa-tracker",
    },
    {
      name: "Projects",
      icon: <VscProjectCompact />,
      path: "/projects",
    },
    {
      name: "Goals",
      icon: <GoGoal />,
      path: "/goals",
    },
    {
      name: "AI Roadmap",
      icon: <FiMap />,
      path: "/ai-roadmap",
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <h2 className="logo" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <LuCat className="logo-icon" size={26} color="#C084FC" />
          CareerTrack<span>AI</span>
        </h2>
      </Link>
      
      <div className="menu">
        {menu.map((item, index) => (
          <NavLink
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
            key={index}
          >
            {item.icon}
            <p>{item.name}</p>
          </NavLink>
        ))}
      </div>
      
      <div className="sidebar-banner">
        <div className="banner-icon">
          <Rocket size={22} />
        </div>
        <p>Stay consistent and you will achieve your dream placement!</p>
      </div>
    </aside>
  );
}

export default Sidebar;