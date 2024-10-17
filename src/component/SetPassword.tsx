import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretRightOutlined, LoadingOutlined } from "@ant-design/icons";
import { Alert, Spin, Modal, Button } from "antd";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";

const setPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SetPasswordFormInputs = z.infer<typeof setPasswordSchema>;

function SetPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormInputs>({
    resolver: zodResolver(setPasswordSchema),
  });

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token");
  let checksum = searchParams.get("checksum");

  useEffect(() => {
    if (checksum) {
      checksum = checksum.replace(/ /g, "+");
      searchParams.set("checksum", checksum);
      setSearchParams(searchParams);
    }
  }, [checksum, searchParams, setSearchParams, token]);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const onSubmit = async (data: SetPasswordFormInputs) => {
    setLoading(true);
    setApiError(null);
    setTimeout(async () => {
      try {
        const response = await axios.post(
          `${baseUrl}/api/v1/auth/validate-account/${token}`,
          {
            password: data.newPassword,
            confirmPwd: data.confirmPassword,
          },
          {
            headers: {
              authorization: checksum,
            },
          }
        );

        setStatusCode(response.data.status);
        setStatusMessage(
          response.data.status === 200 || response.data.status === 201
            ? "Your password has been set successfully."
            : "An error occurred while setting your password."
        );
        setStatusModalVisible(true);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const errorMessage =
            err.response?.data?.message || "An error occurred";
          setApiError(errorMessage);
          setStatusCode(err.response?.status || null);
          setStatusMessage(errorMessage);
          setStatusModalVisible(true);
        } else {
          setApiError("Unexpected error occurred.");
          setStatusCode(null);
          setStatusMessage("Unexpected error occurred.");
          setStatusModalVisible(true);
        }
      } finally {
        setLoading(false);
      }
    }, 3000);
  };

  const handleModalOk = () => {
    setStatusModalVisible(false);
    if (statusCode === 200 || statusCode === 201) {
      navigate("/login");
    }
  };

  const styles = {
    mask: {
      backgroundColor: "#0C743FC9",
    },
    body: {
      borderRadius: "0 !important",
    },
  };

  return (
    <section className="section-bg flex items-center justify-center min-h-screen bg-gray-100 select-none">
      <div className="w-full max-w-md p-4 rounded-md shadow-sm bg-white/80">
        <div className="text-center mb-8">
  
          <h2 className="text-xl md:text-3xl font-bold text-gray-800">
            SET PASSWORD
          </h2>
          <p className="text-black text-sm font-normal">
            Set and confirm your new password to continue in the private area
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
              htmlFor="newPassword"
              className="text-sm text-black mb-2 flex items-center"
            >
              <span className="text-red-500">*</span> New Password
            </label>
            <input
              type="password"
              id="newPassword"
              autoComplete="new-password"
              {...register("newPassword")}
              className="w-full px-3 py-2 rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 text-sm placeholder:text-sm placeholder:font-normal"
              placeholder="********"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm">
                {errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="text-sm text-black mb-2 flex items-center"
            >
              <span className="text-red-500">*</span> Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="w-full px-3 py-2 rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 text-sm placeholder:text-sm placeholder:font-normal"
              placeholder="********"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-none bg-[#0C743F] text-white font-bold hover:bg-[#0c743ebe] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? (
              <>
                <span>Confirm</span>
                <Spin
                  className="ml-5"
                  indicator={
                    <LoadingOutlined
                      spin
                      className="text-white font-extrabold"
                    />
                  }
                />
              </>
            ) : (
              <>
                <span>Confirm</span>
                <CaretRightOutlined
                  className="w-30 h-30 ml-5 text-white justify-center mt-1"
                  style={{ float: "right" }}
                />
              </>
            )}
          </button>
        </form>
        <div>&nbsp;</div>
      </div>
      <Modal
        visible={statusModalVisible}
        onCancel={handleModalOk}
        footer={null}
        styles={styles}
        closeIcon={null}
      >
        {statusCode === 200 || statusCode === 201 ? (
          <>
            <div className="center-container font-bold">
              <img src={success} alt="" className="mt-10" />
              <span className="text-3xl my-5 text-[#0C743F]">Thank you!</span>
              <span className="text-lg text-[#0C743F]">{statusMessage}</span>
            </div>
            <div className="flex items-center justify-center my-5">
              <Button
                key="Ok"
                onClick={handleModalOk}
                className="lg:w-[32%] sm:w-full p-5 text-[#757575] font-bold rounded-none"
              >
                OK
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="center-container font-bold">
              <img src={icoerror} alt="" className="mt-10" />
              <span className="text-3xl my-5 text-[#FF0000]">Oooops!</span>
              <span className="text-lg text-[#FF0000]">{statusMessage}</span>
            </div>
            <div className="flex items-center justify-center my-5">
              <Button
                key="Ok"
                onClick={handleModalOk}
                className="lg:w-[32%] sm:w-full p-5 text-[#FF0000] font-bold rounded-none"
              >
                OK
              </Button>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}

export default SetPassword;
