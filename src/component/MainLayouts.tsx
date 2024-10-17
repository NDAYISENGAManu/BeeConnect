/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  CaretRightOutlined,
  CaretDownOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import SessionCheck from "./SessionCheck";
import { checkHasPolicy } from "../helper/app.helper";

interface MainLayoutProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

interface MenuItem {
  key: string;
  label: string;
  path: string;
  children?: MenuItem[] | null;
}

const hasAccess = (
  requiredPolicies: string[],
  requiredRole: number[],
  requiredOrgType: number[]
) => {
  return checkHasPolicy(requiredPolicies, requiredRole, requiredOrgType);
};

const MainLayout: React.FC<MainLayoutProps> = ({ sidebarCollapsed }) => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  //@ts-ignore
  const menuItems: MenuItem[] = [
    { key: "1", label: "Dashboard", path: "/dashboard" },
    hasAccess([], [1, 2], [1])
      ? { key: "10", label: "Partners", path: "/partners" }
      : null,
    hasAccess([], [1, 2], [1])
      ? {
          key: "2",
          label: "Services",
          path: "/services",
          children: [
            {
              key: "2-1",
              label: "Service Category",
              path: "/service-category",
            },
            { key: "2-2", label: "Services", path: "/services" },
          ],
        }
      : null,
    { key: "3", label: "Applications", path: "/applications" },
    { key: "4", label: "Applicants", path: "/applicants" },
    {
      key: "5",
      label: "Communications",
      path: "/communications",
      children: [
        { key: "5-1", label: "Send SMS", path: "/send-sms" },
        { key: "5-2", label: "Purchase", path: "/purchase" },
        hasAccess([], [1, 2], [1])
          ? { key: "5-3", label: "SMS Accounts", path: "/sms-accounts" }
          : null,
      ],
    },
    {
      key: "13",
      label: "Reports",
      path: "/reports",
      children: [
        {
          key: "13-1",
          label: "Communication report",
          path: "/communication-report",
        },
        {
          key: "13-2",
          label: "Applicants report",
          path: "/applicants-report",
        },
        {
          key: "13-3",
          label: "Employment report",
          path: "/employment-report",
        },
      ],
    },
    { key: "7", label: "Users", path: "/users" },
    hasAccess([], [1, 2], [1])
      ? { key: "11", label: "Permissions", path: "/permissions" }
      : null,
    { key: "12", label: "Enterprises", path: "/enterprises" },
  ].filter(Boolean);

  useEffect(() => {
    const currentPath = location.pathname;

    let foundItem = menuItems.find((item) => item?.path === currentPath);
    if (!foundItem) {
      menuItems.forEach((parent) => {
        if (parent?.children) {
          const activeChild = parent.children.find(
            (child) => child?.path === currentPath
          );
          if (activeChild) {
            foundItem = activeChild;
            setExpandedMenu(parent.key);
          }
        }
      });
    }
    if (foundItem) setActiveItem(foundItem.key); 
  }, [location.pathname]);

  const handleMenuClick = (item: MenuItem) => {
    if (!item.children) {
      navigate(item.path);
    }
  };

  const handleParentMenuClick = (key: string) => {
    setExpandedMenu((prev) => (prev === key ? null : key));
  };

  const renderMenuItems = (items: MenuItem[]): JSX.Element[] => {
    //@ts-ignore
    return items.map((item) => {
      if (!item) return null;
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedMenu === item.key;
      const isActive = activeItem === item.key;

      return (
        <li key={item.key}>
          <a
            href="#"
            className={`flex items-center text-md font-bold py-4 justify-end group m-0 ${
              isActive || isExpanded
                ? "bg-white text-[#0C743F]"
                : "text-gray-600 hover:bg-gray-100"
            } transition-colors duration-200 ease-in-out`}
            onClick={() =>
              hasChildren
                ? handleParentMenuClick(item.key)
                : handleMenuClick(item)
            }
          >
            <span className="ms-3">{item.label}</span>
            {hasChildren ? (
              isExpanded ? (
                <CaretDownOutlined className="w-5 h-5 ml-2 text-[#70BF44]" />
              ) : (
                <CaretRightOutlined
                  className={`flex-shrink-0 w-5 h-5 ${
                    isActive ? "text-green-600" : "text-gray-500"
                  } transition duration-75 ml-1`}
                />
              )
            ) : (
              <MinusOutlined className="w-5 h-5 ml-1 invisible" />
            )}
          </a>
          {hasChildren && isExpanded && (
            <ul className="bg-white">
              {item.children && renderMenuItems(item.children)}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <div className="w-full font-roboto mt-24 relative">
      <aside
        className={`fixed bg-[#ebf4f0] top-26 left-0 w-64 h-full transition-transform z-10 ${
          sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full overflow-y-auto">
          <ul>{renderMenuItems(menuItems)}</ul>
        </div>
      </aside>
      <div className="p-4 sm:ml-64">
        <SessionCheck />
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
