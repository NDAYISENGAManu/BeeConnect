/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  CaretRightOutlined,
  MinusOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import Dashboards from "../component/Dashboards";
import Services from "../component/Services";
import UsersAccounts from "../component/UsersAccounts";
import Applications from "../component/Applications";
import Farmers from "../component/Farmers";
import Partners from "../component/Partners";
import UserPermissions from "../component/UserPermissions";
import ServiceCategory from "../component/ServiceCategory";
import { useAuth } from "../context/AuthContext";
import Purchase from "../component/Purchase";
import SmsAccounts from "../component/SmsAccounts";
import { isTokenValid } from "../helper/validation.heper";
import SendSms from "../component/SendSMS";
import ApplicantsReport from "../component/ApplicantsReport";
import CommunicationsReport from "../component/CommunicationsReport";
import { checkHasPolicy } from "../helper/app.helper";
import Enterprise from "../component/Enterprise";

interface DashboardProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

interface MenuItem {
  key: string;
  label: string;
  children?: MenuItem[];
}

const Dashboard: React.FC<DashboardProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const [activeItems, setActiveItems] = useState<string>("1");
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const { logout } = useAuth();

  const menuItems: MenuItem[] = [
    { key: "1", label: "Dashboard" },

    { key: "10", label: "Partners" },
    {
      key: "2",
      label: "Services",
      children: [
        { key: "2-1", label: "Service Category" },
        { key: "2-2", label: "Services" },
      ],
    },
    { key: "3", label: "Applications" },
    { key: "4", label: "Applicants" },
    {
      key: "5",
      label: "Communications",
      children: [
        { key: "5-1", label: "Send SMS" },
        { key: "5-2", label: "Purchase" },
        { key: "5-3", label: "SMS Accounts" },
      ],
    },
    {
      key: "8",
      label: "Reports",
      children: [
        { key: "8-1", label: "Applicants" },
        { key: "8-2", label: "Communication" },
        { key: "8-3", label: "Payments" },
      ],
    },
    // { key: "6", label: "Payments" },
    { key: "7", label: "Users" },
    { key: "11", label: "Permissions" },
    {
      key: "12",
      label: "Enterprises",
    },
  ];

  const hasAccess = (
    requiredPolicies: string[],
    requiredRole: number[],
    requiredOrgType: number[]
  ) => {
    return checkHasPolicy(requiredPolicies, requiredRole, requiredOrgType);
  };

  const itemContents = {
    "1": <Dashboards />,
    "10": hasAccess([], [1, 2], [1]) ? <Partners /> : null,
    "2": hasAccess([], [1, 2], [1]) ? parent : null,
    "2-1": hasAccess([], [1, 2], [1]) ? <ServiceCategory /> : null,
    "2-2": hasAccess([], [1, 2], [1]) ? <Services /> : null,
    "3": <Applications />,
    "4": <Farmers />,
    "5": parent,
    "5-1": <SendSms />,
    "5-2": <Purchase />,
    "5-3": hasAccess([], [1, 2], [1]) ? <SmsAccounts /> : null,
    // "6": <Payments />,
    "11": hasAccess([], [1, 2], [1]) ? <UserPermissions /> : null,
    "7": <UsersAccounts />,
    "8": hasAccess([], [1, 2], [1, 2]) ? true : null,
    "8-1": <ApplicantsReport />,
    "8-2": <CommunicationsReport />,
    "12": <Enterprise />,
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const verifyToken = () => {
    if (!isTokenValid()) {
      setTimeout(() => {
        logout();
        window.location.href = "/login";
      }, 3000);
    }
  };

  const handleMenuClick = (key: string, hasChildren: boolean) => {
    if (hasChildren) {
      if (expandedMenu === key) {
        setExpandedMenu(null);
      } else {
        setExpandedMenu(key);
      }
    } else {
      setActiveItems(key);
    }
    if (window.innerWidth <= 768) {
      //setSidebarCollapsed(true);
      //toggleSidebar();
    }
  };

  const renderMenuItems = (items: MenuItem[]): JSX.Element[] => {
    return items
      .filter((item) => {
        const content = itemContents[item.key as keyof typeof itemContents];
        return content !== null && content !== undefined;
      })
      .map((item) => {
        const hasChildren = !!item.children;
        const isExpanded = expandedMenu === item.key;

        // Check if any child item is active
        const isActiveParent =
          hasChildren &&
          item.children?.some((child) => activeItems === child.key);

        return (
          <li key={item.key}>
            <a
              href="#"
              className={`flex items-center text-md font-bold py-4 justify-end group m-0 ${
                activeItems === item.key ||
                expandedMenu === item.key ||
                isActiveParent
                  ? "bg-white text-[#0C743F]"
                  : "text-gray-600 hover:bg-gray-100"
              } transition-colors duration-200 ease-in-out ${
                isActiveParent ? "text-black" : ""
              }`}
              onClick={() => handleMenuClick(item.key, hasChildren)}
            >
              <span className="ms-3">{item.label}</span>
              {hasChildren ? (
                isExpanded ? (
                  <CaretDownOutlined className="w-5 h-5 ml-2 text-[#70BF44]" />
                ) : (
                  <CaretRightOutlined
                    className={`flex-shrink-0 w-5 h-5 ${
                      activeItems === item.key || isActiveParent
                        ? "text-green-600"
                        : "text-gray-500"
                    } transition duration-75 ml-1`}
                  />
                )
              ) : (
                <MinusOutlined className="w-5 h-5 ml-1 text-[#70BF44] invisible" />
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
        toggleSidebar();
      } else {
        setSidebarCollapsed(false);
      }
    };

    verifyToken();
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeItems]);

  return (
    <div className="w-full font-roboto mt-24 relative">
      <aside
        id="default-sidebar"
        className={`fixed bg-[#ebf4f0] top-26 left-0 w-64 h-full transition-transform z-10 ${
          sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full overflow-y-auto">
          <ul className="">{renderMenuItems(menuItems)}</ul>
        </div>
      </aside>
      <div className="p-4 sm:ml-64">
        {/* @ts-ignore */}
        {activeItems && itemContents[activeItems as keyof typeof itemContents]}
      </div>
    </div>
  );
};

export default Dashboard;
