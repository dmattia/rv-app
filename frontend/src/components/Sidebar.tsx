import {
  ProSidebar,
  SidebarHeader,
  SidebarFooter,
  Menu,
  MenuItem,
  SubMenu,
} from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import { FaGem, FaHeart, FaGithub, FaBars } from "react-icons/fa";
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
          <div
            style={{
              padding: "24px",
              textTransform: "uppercase",
              fontWeight: "bold",
              fontSize: 14,
              letterSpacing: "1px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            RV App
          </div>
        </SidebarHeader>
        <Menu iconShape="square">
          <MenuItem icon={<FaGem />}>
            Profile <Link to="/" />
          </MenuItem>
          <SubMenu title="Destinations" icon={<FaHeart />}>
            <MenuItem>
              Map <Link to="/destinations/map" />
            </MenuItem>
            <MenuItem>
              Create <Link to="/destinations/new" />
            </MenuItem>
          </SubMenu>
        </Menu>
        <SidebarFooter style={{ textAlign: "center" }}>
          <div
            className="sidebar-btn-wrapper"
            style={{
              padding: "20px 24px",
            }}
          >
            <a
              href="https://github.com/dmattia/rv-app"
              target="_blank"
              className="sidebar-btn"
              rel="noopener noreferrer"
              color="white"
            >
              <FaGithub />
              <span
                style={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                View Source
              </span>
            </a>
          </div>
        </SidebarFooter>
      </ProSidebar>
      <div className="btn-toggle" onClick={() => setToggled(true)}>
        <FaBars />
      </div>
    </>
  );
}
