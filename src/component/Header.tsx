import React, { useEffect, useState } from "react";
// import logo from "../assets/logo.svg";
// import line from "../assets/Line.svg";
import toggleMenu from "../assets/menu-toggle.svg";
import {
  CaretDownOutlined,
  UserOutlined,
  CloseOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { Avatar, Button, Dropdown, Modal } from "antd";
import LoadingPage from "./LoadingPage";
import axios from "axios";

interface HeaderProps {
  onLoginClick: () => void;
  onAboutsClick: () => void;
  onHowItWorks: () => void;
  onImpact: () => void;
  onContact: () => void;
  toggleDashboardSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onAboutsClick,
  onContact,
  onHowItWorks,
  onImpact,
  toggleDashboardSidebar,
}) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const { setShowLoginForm, sessionId, organizationType, organizationId } =
    useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const { logout } = useAuth();
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const handleItemClick = () => setIsNavCollapsed(true);

  const showLogoutModal = () => {
    setIsLogoutModalVisible(true);
  };

  const handleLogoutConfirm = () => {
    setIsLogoutModalVisible(false);
    setIsLoading(true);
    setTimeout(() => {
      logout();
      window.location.href = "/login";
    }, 3000);
  };

  const handleBaseUrl = () => {
    window.location.replace("/");
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalVisible(false);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        let url = `${baseUrl}/api/v1/sms-purchases/balance`;
        if (organizationType === 1) {
          url += `?orgId=${organizationId}`;
        }

        const response = await axios.get(url, {
          headers: { "x-auth-token": token },
        });

        setBalance(response.data.data.balance);
        if (balance === 0) {
          setNoticeVisible(true);
        }
      } catch (error) {
        // console.error("Error fetching balance", error);
      }
    };

    if (sessionId && organizationType === 1) {
      fetchBalance();
    }
  }, [sessionId, organizationType]);

  const menu = (
    <div className="bg-[#0C743F] rounded-lg py-2">
      <ul className="bg-transparent p-0 m-0">
        <li className="flex items-center py-3 px-10 text-sm font-semibold hover:bg-white hover:text-[#0C743F] text-white cursor-pointer">
          <UserOutlined className="mr-2 font-medium text-lg" />
          Profile
        </li>
        <li
          className="flex items-center py-3 px-10 text-sm font-semibold hover:bg-white hover:text-[#0C743F] text-white cursor-pointer"
          onClick={showLogoutModal}
        >
          <LogoutOutlined className="mr-2 font-medium text-lg" />
          Logout
        </li>
      </ul>
    </div>
  );

  const styles = {
    mask: {
      backgroundColor: "#0C743FC9",
    },
    body: {
      borderRadius: "0 !important",
    },
  };

  return (
    <>
      <header className="header text-[#0C743F] px-4 sm:px-16 py-2 w-full font-roboto flex justify-between items-center fixed top-0">
        <div className="flex items-center">
          {/* <img
            src={logo}
            onClick={handleBaseUrl}
            alt="Company Logo"
            className="w-30 h-30 sm:w-16 sm:h-16 lg:w-32 lg:h-20  lg:mx-4 cursor-pointer"
            // draggable="false"
          />
          <img src={line} alt="Line" className="w-10 h-10 lg:mx-2" /> */}
          <h2
            className="text-mdyy sm:text-xl lg:text-2xl font-bold ml-2 mt-2 cursor-pointer"
            onClick={handleBaseUrl}
          >
            Beeconnect
          </h2>
        </div>

        {sessionId &&
          noticeVisible &&
          balance === 0 &&
          organizationType === 1 && (
            <div className="bg-yellow-300 text-black px-3 pt-3 pb-0 h-15 rounded-lg flex justify-between items-center w-[50%]">
              <p className="font-normal">
                We noticed that you don't have SMS balance, hence SMS for
                application approvals and others won't be delivered to users.
                Please recharge your SMS balance!!
              </p>
              <CloseOutlined
                className="text-lg cursor-pointer self-center pb-3"
                onClick={() => setNoticeVisible(false)}
              />
            </div>
          )}

        {sessionId ? (
          <div>
            <button
              data-drawer-target="default-sidebar"
              data-drawer-toggle="default-sidebar"
              aria-controls="default-sidebar"
              type="button"
              className="inline-flex items-center p-1 mx-4 top-8 mt-[-22] text-sm text-[#0C743F] border-[#0C743F] border rounded-md sm:hidden bg-[#ebf4f0] focus:outline-none focus:ring-1 focus:ring-[#0C743F] right-0 fixed"
              onClick={toggleDashboardSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <img
                src={toggleMenu}
                alt="Company Logo"
                className="w-7 h-7 sm:w-16 sm:h-16 lg:w-40 lg:h-20 text-[#0C743F]"
              />
            </button>
          </div>
        ) : (
          <button
            id="dropdownNavbarLink"
            className="md:hidden flex items-center justify-between w-auto py-1 ml-2 text-[#0C743F] rounded bg-gray-200 hover:bg-gray-300"
            onClick={handleNavCollapse}
          >
            {isNavCollapsed ? (
              <img
                src={toggleMenu}
                alt="Company Logo"
                className="w-6 h-6 sm:w-16 sm:h-16 lg:w-40 lg:h-20"
              />
            ) : (
              <CloseOutlined className="text-xl" />
            )}
          </button>
        )}

        <div
          id="dropdownNavbar"
          className={`absolute top-0 left-0 z-10 ${
            isNavCollapsed ? "hidden" : "block"
          } font-normal bg-[#0C743F] my-2 mx-2 divide-y divide-gray-100 rounded-lg shadow w-[96%] h-fit md:hidden`}
        >
          <ul className="py-2 px-2 text-sm">
            <li className="text-white hover:text-[#0C743F]">
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  onContact();
                  handleItemClick();
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm mt-1">Contact</span>
                </div>
              </a>
            </li>
            <li className="text-white hover:text-[#0C743F]">
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  onAboutsClick();
                  handleItemClick();
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm mt-1">About Project</span>
                </div>
              </a>
            </li>
            <li className="text-white hover:text-[#0C743F]">
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  onHowItWorks();
                  handleItemClick();
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm mt-1">Our approach</span>
                </div>
              </a>
            </li>
            <li className="text-white hover:text-[#0C743F]">
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  onImpact();
                  handleItemClick();
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm mt-1">Impact</span>
                </div>
              </a>
            </li>
            <li className="text-white hover:text-[#0C743F]">
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  setShowLoginForm(true);
                  handleItemClick();
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm mt-1">Login</span>
                </div>
              </a>
            </li>
          </ul>
        </div>

        <div className="hidden md:flex md:items-center space-x-4">
          <div
            className="flex flex-row items-center gap-2 cursor-pointer"
            onClick={() => {
              setShowLoginForm(true);
              handleItemClick();
            }}
          >
            <div className="flex flex-col items-center">
              {!sessionId ? (
                <>
                  <UserOutlined style={{ fontSize: "24px" }} />
                  <span className="text-sm mt-1">LOGIN</span>
                </>
              ) : (
                <>
                  <Dropdown overlay={menu} trigger={["click"]}>
                    <button style={{ padding: 0 }}>
                      <Avatar
                        size="large"
                        style={{ backgroundColor: "#0C743F" }}
                        icon={<UserOutlined />}
                      />
                      <CaretDownOutlined className="text-[#0C743F]" />
                    </button>
                  </Dropdown>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <Modal
        onOk={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        okText="Logout"
        cancelText="Cancel"
        title={
          <span style={{ color: "#008532", fontSize: "20px" }}>
            Confirm Logout
          </span>
        }
        open={isLogoutModalVisible}
        closeIcon={null}
        styles={styles}
        width={700}
        footer={null}
      >
        <p className="my-5 text-medium">Are you sure you want to logout?</p>
        <Button
          key="ok"
          onClick={handleLogoutConfirm}
          className="w-full p-5 bg-[#0C743F] text-white font-bold rounded-none"
        >
          OK
        </Button>
      </Modal>
      {isLoading && <LoadingPage />}
    </>
  );
};

export default Header;
