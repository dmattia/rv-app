import {
  ProSidebar,
  SidebarHeader,
  Menu,
  MenuItem,
  SubMenu,
} from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import { FaGem, FaHeart, FaBars } from "react-icons/fa";
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
            RV App
          </div>
        </SidebarHeader>
        <Menu iconShape="square">
          <MenuItem icon={<FaGem />}>
            Profile <Link to="/" />
          </MenuItem>
          <SubMenu title="Destinations" icon={<FaHeart />}>
            <MenuItem>
              Table <Link to="/destinations/table" />
            </MenuItem>
            <MenuItem>
              Map <Link to="/destinations/map" />
            </MenuItem>
          </SubMenu>
        </Menu>
      </ProSidebar>
      <div className="btn-toggle md:hidden" onClick={() => setToggled(true)}>
        <FaBars />
      </div>
    </>
  );
}
