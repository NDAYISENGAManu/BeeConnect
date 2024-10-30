import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Home from "./pages/Home";
import Header from "./component/Header";
import Error500 from "./component/Error500";
import NotFound from "./component/NotFound";
import SetPassword from "./component/SetPassword";
import Login from "./pages/Login";
import Applications from "./component/Applications";
import Dashboards from "./component/Dashboards";
import Services from "./component/Services";
import UsersAccounts from "./component/UsersAccounts";
import Farmers from "./component/Farmers";
import Partners from "./component/Partners";
import UserPermissions from "./component/UserPermissions";
import ServiceCategory from "./component/ServiceCategory";
import Purchase from "./component/Purchase";
import SmsAccounts from "./component/SmsAccounts";
import SendSms from "./component/SendSMS";
import ApplicantsReport from "./component/ApplicantsReport";
import CommunicationsReport from "./component/CommunicationsReport";
import Enterprise from "./component/Enterprise";
import MainLayout from "./component/MainLayouts";
import EmploymentReport from "./component/EmploymentReport";
import ForgotPassword from "./component/ForgetPassword";

function App() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showAbouts, setShowAbouts] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showImpacts, setShowImpacts] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [, setActiveItem] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLoginClick = () => {
    setShowLoginForm(true);
  };

  const handleAbouts = () => {
    setShowAbouts(true);
  };

  const handleHowItWorks = () => {
    setShowLoginForm(false);
    setShowAbouts(false);
    setShowHowItWorks(true);
    setShowContacts(false);
    setShowImpacts(false);
    setActiveItem(null);
    setShowLoginForm(false);
  };

  const handleImpacts = () => {
    setShowImpacts(true);
  };

  const handleContacts = () => {
    setShowContacts(true);
  };

  const toggleDashboardSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const basename = import.meta.env.MODE === "staging" ? "/" : "/";

  return (
    <Router basename={basename}>
      <AuthProvider>
        <Header
          onLoginClick={handleLoginClick}
          onAboutsClick={handleAbouts}
          onContact={handleContacts}
          onImpact={handleImpacts}
          onHowItWorks={handleHowItWorks}
          toggleDashboardSidebar={toggleDashboardSidebar}
        />
        {/* <SessionCheck /> */}
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-ignore
                  showLoginForm={showLoginForm}
                  showAbouts={showAbouts}
                  showHowItWorks={showHowItWorks}
                  showImpacts={showImpacts}
                  showContacts={showContacts}
                />
              }
            />
            <Route path="set-password" element={<SetPassword />} />
            <Route path="forget-password" element={<ForgotPassword />} />
            <Route
              path="login"
              element={
                <Login
                  showLoginForm={showLoginForm}
                  showAbouts={false}
                  showHowItWorks={false}
                  showImpacts={false}
                  showContacts={false}
                />
              }
            />
            <Route
              element={
                <MainLayout
                  sidebarCollapsed={sidebarCollapsed}
                  setSidebarCollapsed={setSidebarCollapsed}
                />
              }
            >
              <Route path="dashboard" element={<Dashboards />} />
              <Route path="partners" element={<Partners />} />
              <Route path="service-category" element={<ServiceCategory />} />
              <Route path="services" element={<Services />} />
              <Route path="applications" element={<Applications />} />
              <Route path="applicants" element={<Farmers />} />
              <Route path="send-sms" element={<SendSms />} />
              <Route path="purchase" element={<Purchase />} />
              <Route path="sms-accounts" element={<SmsAccounts />} />
              <Route path="users" element={<UsersAccounts />} />
              <Route path="permissions" element={<UserPermissions />} />
              <Route path="enterprises" element={<Enterprise />} />
              <Route path="applicants-report" element={<ApplicantsReport />} />
              <Route path="employment-report" element={<EmploymentReport />} />
              <Route
                path="communication-report"
                element={<CommunicationsReport />}
              />
              <Route path="error500" element={<Error500 />} />

              <Route path="dashboard/*" element={<NotFound />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
}

export default App;
