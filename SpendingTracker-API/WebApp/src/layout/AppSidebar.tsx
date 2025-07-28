import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; }[];
};

type Section = {
  name: string;
  items: NavItem[];
}

const sections: Section[] = [
  {
    name: "Menu",
    items: [
      {
        icon: <GridIcon />,
        name: "Dashboard",
        path: "/",
      },
      {
        icon: <i className="fa-solid fa-money-bill"></i>,
        name: "Giao dịch",
        path: "/transactions",
      },
    ]
  },
  {
    name: "Khác",
    items: [
      {
        icon: <UserCircleIcon />,
        name: "User Profile",
        path: "/profile",
      },
      {
        name: "Forms",
        icon: <ListIcon />,
        subItems: [{ name: "Form Elements", path: "/form-elements" }],
      },
      {
        name: "Tables",
        icon: <TableIcon />,
        subItems: [{ name: "Basic Tables", path: "/basic-tables" }],
      },
      {
        name: "Pages",
        icon: <PageIcon />,
        subItems: [
          { name: "Blank Page", path: "/blank" },
          { name: "404 Error", path: "/error-404" },
        ],
      },
      {
        icon: <PieChartIcon />,
        name: "Charts",
        subItems: [
          { name: "Line Chart", path: "/line-chart" },
          { name: "Bar Chart", path: "/bar-chart" },
        ],
      },
      {
        icon: <BoxCubeIcon />,
        name: "UI Elements",
        subItems: [
          { name: "Alerts", path: "/alerts" },
          { name: "Avatar", path: "/avatars" },
          { name: "Badge", path: "/badge" },
          { name: "Buttons", path: "/buttons" },
          { name: "Images", path: "/images" },
          { name: "Videos", path: "/videos" },
        ],
      },
      {
        icon: <PlugInIcon />,
        name: "Authentication",
        subItems: [
          { name: "Sign In", path: "/signin" },
          { name: "Sign Up", path: "/signup" },
        ],
      },
    ]
  }
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    section: string;
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => path == '/' ?
      location.pathname === path :
      location.pathname.includes(path),
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    sections.forEach((section) => {
      section.items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                section: section.name,
                index,
              });
              submenuMatched = true;
              return;
            }
          });
        }
      });
    })

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.section}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, section: string) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.section === section &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { section: section, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
            {sections.map((section) => (
              <div key={section.name}>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    section.name
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                <ul className="mb-6 flex flex-col gap-4">
                  {section.items.map((nav, index) => (
                    <li key={nav.name}>
                      {nav.subItems ? (
                        <button
                          onClick={() => handleSubmenuToggle(index, section.name)}
                          className={`menu-item group ${
                            openSubmenu?.section === section.name && openSubmenu?.index === index
                              ? "menu-item-active"
                              : "menu-item-inactive"
                          } cursor-pointer ${
                            !isExpanded && !isHovered
                              ? "lg:justify-center"
                              : "lg:justify-start"
                          }`}
                        >
                          <span
                            className={`menu-item-icon-size  ${
                              openSubmenu?.section === section.name && openSubmenu?.index === index
                                ? "menu-item-icon-active"
                                : "menu-item-icon-inactive"
                            }`}
                          >
                            {nav.icon}
                          </span>
                          {(isExpanded || isHovered || isMobileOpen) && (
                            <span className="menu-item-text">{nav.name}</span>
                          )}
                          {(isExpanded || isHovered || isMobileOpen) && (
                            <ChevronDownIcon
                              className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                openSubmenu?.section === section.name &&
                                openSubmenu?.index === index
                                  ? "rotate-180 text-brand-500"
                                  : ""
                              }`}
                            />
                          )}
                        </button>
                      ) : (
                        nav.path && (
                          <Link
                            to={nav.path}
                            className={`menu-item group ${
                              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                            }`}
                          >
                            <span
                              className={`menu-item-icon-size ${
                                isActive(nav.path)
                                  ? "menu-item-icon-active"
                                  : "menu-item-icon-inactive"
                              }`}
                            >
                              {nav.icon}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                              <span className="menu-item-text">{nav.name}</span>
                            )}
                          </Link>
                        )
                      )}
                      {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                        <div
                          ref={(el) => {
                            subMenuRefs.current[`${section.name}-${index}`] = el;
                          }}
                          className="overflow-hidden transition-all duration-300"
                          style={{
                            height:
                              openSubmenu?.section === section.name && openSubmenu?.index === index
                                ? `${subMenuHeight[`${section.name}-${index}`]}px`
                                : "0px",
                          }}
                        >
                          <ul className="mt-2 space-y-1 ml-9">
                            {nav.subItems.map((subItem) => (
                              <li key={subItem.name}>
                                <Link
                                  to={subItem.path}
                                  className={`menu-dropdown-item ${
                                    isActive(subItem.path)
                                      ? "menu-dropdown-item-active"
                                      : "menu-dropdown-item-inactive"
                                  }`}
                                >
                                  {subItem.name}
                                  <span className="flex items-center gap-1 ml-auto"></span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
