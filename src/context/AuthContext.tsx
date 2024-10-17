import { createContext, ReactNode, useState, useContext } from "react";

interface AuthContextType {
  sessionId: string | null;
  token: string | null;
  firstName: string | null;
  lastName: string | null;
  userType: number | null;
  role: number | null;
  nationalId: string | null;
  policies: string[] | null;
  organizationType: number | null;
  organizationId: string | null;
  organizationName: string | null;
  login: (
    token: string,
    sessionId: string,
    userInfo: {
      firstName: string;
      lastName: string;
      userType: number;
      role: number;
      nationalId: string;
      policies: string[];
      organization: {
        type: number;
        _id: string;
        name: string;
      };
    }
  ) => void;
  logout: () => void;
  showLoginForm: boolean;
  setShowLoginForm: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem("sessionId")
  );
  const [firstName, setFirstName] = useState<string | null>(() =>
    localStorage.getItem("firstName")
  );
  const [lastName, setLastName] = useState<string | null>(() =>
    localStorage.getItem("lastName")
  );
  const [userType, setUserType] = useState<number | null>(() => {
    const userTypeString = localStorage.getItem("userType");
    return userTypeString ? Number(userTypeString) : null;
  });
  const [role, setRole] = useState<number | null>(() => {
    const roleString = localStorage.getItem("role");
    return roleString ? Number(roleString) : null;
  });
  const [nationalId, setNationalId] = useState<string | null>(() =>
    localStorage.getItem("nationalId")
  );
  const [policies, setPolicies] = useState<string[] | null>(() => {
    try {
      const policiesString = localStorage.getItem("policies");
      return policiesString ? JSON.parse(policiesString) : null;
    } catch (e) {
      console.error("Error parsing policies from localStorage:", e);
      return null;
    }
  });
  const [organizationType, setOrganizationType] = useState<number | null>(
    () => {
      const organizationTypeString = localStorage.getItem("organizationType");
      return organizationTypeString ? Number(organizationTypeString) : null;
    }
  );
  const [organizationId, setOrganizationId] = useState<string | null>(
    () => {
      const organizationIdString = localStorage.getItem("organizationId");
      return organizationIdString ? String(organizationIdString) : null;
    }
  );
  const [organizationName, setOrganizationName] = useState<string | null>(() => {
    const organizationNameString = localStorage.getItem("organizationName");
    return organizationNameString ? String(organizationNameString) : null;
  });
  const [showLoginForm, setShowLoginForm] = useState(false);

  const login = (
    newToken: string,
    newSessionId: string,
    userInfo: {
      firstName: string;
      lastName: string;
      userType: number;
      role: number;
      nationalId: string;
      policies: string[];
      organization: {
        type: number;
        _id: string;
        name: string;
      };
    }
  ) => {
    setToken(newToken);
    setSessionId(newSessionId);
    setFirstName(userInfo.firstName);
    setLastName(userInfo.lastName);
    setUserType(userInfo.userType);
    setRole(userInfo.role);
    setNationalId(userInfo.nationalId);
    setPolicies(userInfo.policies);
    setOrganizationType(userInfo.organization.type);
    setOrganizationId(userInfo.organization._id);
    setOrganizationName(userInfo.organization.name);
    localStorage.setItem("token", newToken);
    localStorage.setItem("sessionId", newSessionId);
    localStorage.setItem("firstName", userInfo.firstName);
    localStorage.setItem("lastName", userInfo.lastName);
    localStorage.setItem("userType", userInfo.userType.toString());
    localStorage.setItem("role", userInfo.role.toString());
    localStorage.setItem("policies", JSON.stringify(userInfo.policies));
    localStorage.setItem(
      "organizationType",
      userInfo.organization.type.toString()
    );
    localStorage.setItem(
      "organizationId",
      userInfo.organization._id.toString()
    );
    localStorage.setItem(
      "organizationName",
      userInfo.organization.name.toString()
    );
    setShowLoginForm(false);
  };

  const logout = () => {
    setToken(null);
    setSessionId(null);
    setFirstName(null);
    setLastName(null);
    setUserType(null);
    setRole(null);
    setNationalId(null);
    setPolicies(null);
    setOrganizationType(null);
    setOrganizationId(null);
    setOrganizationName(null);
    localStorage.removeItem("token");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("userType");
    localStorage.removeItem("role");
    localStorage.removeItem("nationalId");
    localStorage.removeItem("policies");
    localStorage.removeItem("organizationType");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("organizationName");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        sessionId,
        firstName,
        lastName,
        userType,
        role,
        nationalId,
        policies,
        organizationType,
        organizationId,
        organizationName,
        login,
        logout,
        showLoginForm,
        setShowLoginForm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
