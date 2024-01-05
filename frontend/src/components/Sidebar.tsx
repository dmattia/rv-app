import {
  ProSidebar,
  SidebarHeader,
  Menu,
  MenuItem,
} from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaCaravan } from "react-icons/fa";
import { useState, useEffect } from "react";

import "react-pro-sidebar/dist/css/styles.css";

export function Sidebar() {
  const [toggled, setToggled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setToggled(false);
  }, [location]);

  return (
    <>
      <ProSidebar
        breakPoint="md"
        toggled={toggled}
        onToggle={() => setToggled(false)}
      >
        <SidebarHeader>
          <div className="p-6 uppercase font-bold text-xl overflow-hidden truncate text-center">
            Recreation.gov App
          </div>
        </SidebarHeader>
        <Menu iconShape="square">
          <MenuItem icon={<FaCaravan />}>
            Recreation.gov Subs <Link to="/" />
          </MenuItem>
        </Menu>
      </ProSidebar>
      <div className="btn-toggle md:hidden" onClick={() => setToggled(true)}>
        <FaBars />
      </div>
    </>
  );
}
