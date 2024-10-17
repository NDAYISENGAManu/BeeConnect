import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretRightOutlined, LoadingOutlined } from "@ant-design/icons";
import { Alert, Spin } from "antd";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }, 
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    setApiError(null);

    try {
      const response = await axios.post(`${baseUrl}/api/v1/auth/logIn`, data);
      const token = response.headers["x-auth-token"];

      if (response.data.data && response.data.data.sessionId) {
        const userInfo = {
          firstName: response.data.data.firstName,
          lastName: response.data.data.lastName,
          userType: response.data.data.userType,
          role: response.data.data.role,
          nationalId: response.data.data.nationalId,
          policies: response.data.data.policies || [],
          organization: response.data.data.organization || { type: 0 },
        };

        login(
          response.data.data.token,
          response.data.data.sessionId,
          userInfo
        );
        localStorage.setItem("token", token);
        navigate("/dashboard");
      } else {
        console.error("Session ID is undefined in the response.");
        setApiError("Login failed, session ID is missing.");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error("Login error status:", err.response.status);
          if (err.response.status === 500) {
            navigate("/error500");
          } else {
            console.error("Login error message:", err.response.data.message);
            setApiError(err.response.data.message);
          }
        } else {
          console.error("Network error:", err.message);
          setApiError("Network error, please try again.");
        }
      } else {
        console.error("Unexpected error:", err);
        setApiError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:h-[550px] max-w-md px-5 md:px-2 md:p-4 rounded-md shadow-sm">
      <div className="text-center mb-3 md:mb-8 pt-10">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800">LOGIN</h1>
        <p className="text-black text-sm font-normal">
          Enter your credentials to continue in the private area
        </p>
      </div>
      {apiError && (
        <Alert
          description={apiError}
          type="error"
          showIcon
          className="py-2 mb-3"
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label
            htmlFor="email"
            className="text-sm text-black mb-2 flex items-center"
          >
            <span className="text-red-500 mr-1">*</span>Email address
          </label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            {...register("email")}
            className="w-full px-3 py-2 rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 text-sm placeholder:text-sm placeholder:font-normal"
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="text-sm text-black mb-2 flex items-center"
          >
            <span className="text-red-500">*</span>Password
          </label>
          <input
            type="password"
            id="password"
            autoComplete="current-password"
            {...register("password")}
            className="w-full px-3 py-2 rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500  text-sm placeholder:text-sm placeholder:font-normal"
            placeholder="********"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-1 focus:ring-[#0C743F]"
          />
          <label htmlFor="remember" className="text-sm ml-2 text-gray-700">
            Remember me
          </label>
        </div>
        <button
          type="submit"
          className="w-full px-3 py-2 bg-[#0C743F] text-white font-bold hover:bg-[#0c743ebe] focus:outline-none rounded-none"
          disabled={loading}
        >
          {loading ? (
            <>
              <span>Login</span>
              <Spin
                className="ml-5"
                indicator={
                  <LoadingOutlined
                    spin
                    className=" text-white font-extrabold"
                  />
                }
              />
            </>
          ) : (
            <>
              <span>Login</span>
              <CaretRightOutlined className="w-30 h-30 ml-5 text-white justify-center mt-1" />
            </>
          )}
        </button>
      </form>
      <div>&nbsp;</div>
    </div>
  );
}

export default LoginForm;
