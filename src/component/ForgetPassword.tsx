import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretRightOutlined, LoadingOutlined } from "@ant-design/icons";
import { Alert, Spin } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotFormInputs = z.infer<typeof forgotSchema>;

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormInputs>({
    resolver: zodResolver(forgotSchema),
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const onSubmit = async (data: ForgotFormInputs) => {
    setLoading(true);
    setApiError(null);

    try {
      const response = await axios.post(`${baseUrl}/api/v1/auth/logIn`, data);
      if (response.status == 200 || response.status == 201) {
        navigate("/dashboard");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 500) {
            navigate("/error500");
          } else {
            setApiError(err.response.data.message);
          }
        } else {
          setApiError("Network error, please try again.");
        }
      } else {
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
          Enter email to receive reset password link to
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
        <button
          type="submit"
          className="w-full px-3 py-2 bg-[#0C743F] text-white font-bold hover:bg-[#0c743ebe] focus:outline-none rounded-none"
          disabled={loading}
        >
          {loading ? (
            <>
              <span>Send link</span>
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
              <span>Send link</span>
              <CaretRightOutlined className="w-30 h-30 ml-5 text-white justify-center mt-1" />
            </>
          )}
        </button>
      </form>
      <div>&nbsp;</div>
    </div>
  );
}

export default ForgotPassword;
