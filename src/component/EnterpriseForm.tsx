/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Select, Button, Modal, Spin } from "antd";
import axios from "axios";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";
import { LoadingOutlined } from "@ant-design/icons";
import { CustomError } from "../types/globalData";

const schema = z.object({
  name: z
    .string()
    .max(100, "Name cannot exceed 100 characters")
    .nonempty("Name is required"),
  tinNumber: z
    .string()
    .min(9, "TIN Number must be exactly 9 digits")
    .max(9, "TIN Number must be exactly 9 digits")
    .regex(/^\d+$/, "TIN Number must be a valid number"),
  type: z.number().min(1, "Type is required"),
  totalYouthEmployed: z.string().regex(/^\d+$/, "Field expect only numbers"),
  noOfYouthRefugees: z.string().regex(/^\d+$/, "Field expect only numbers"),
  noOfYouthIDPs: z.string().regex(/^\d+$/, "Field expect only numbers"),
  noOfYouthPLWDs: z.string().regex(/^\d+$/, "Field expect only numbers"),
  smeCategory: z.number().min(1, "SME category is required"),
  ownerNationalId: z
    .string()
    .min(16, "National ID is required")
    .max(16, "National ID is required"),
  subPartners: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface EnterpriseFormProps {
  fetchEnterprise: () => void;
  isVisible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const EnterpriseForm: React.FC<EnterpriseFormProps> = ({
  fetchEnterprise,
  isVisible,
  onCancel,
  onSuccess,
}) => {
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loadingButtons, setLoadingButtons] = useState(false);
  const { handleSubmit, control, reset, getValues, setError, clearErrors } =
    useForm<FormData>({
      resolver: zodResolver(schema),
    });
  const [ownerForeName, setOwnerForeName] = useState("");
  const [ownerSurname, setOwnerSurname] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const fetchCitizenData = async (nationalId: string) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/user/citizen`,
        { nationalId },
        {
          headers: { "x-auth-token": token },
        }
      );
      if (response.data.data.nidExists) {
        clearErrors("ownerNationalId");
        setOwnerForeName(response.data.data.foreName);
        setOwnerSurname(response.data.data.surname);
        return true;
      } else {
        setError("ownerNationalId", {
          type: "manual",
          message:
            "Owner National is not Registered. Please register through *775#.",
        });
        setOwnerForeName("");
        setOwnerSurname("");
        return false;
      }
    } catch (error) {
      setError("ownerNationalId", {
        type: "manual",
        message: "National ID not found",
      });
      setOwnerForeName("");
      setOwnerSurname("");
      return false;
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    setLoadingButtons(true);
    try {
      const isValidNationalId = await fetchCitizenData(data.ownerNationalId);

      if (!isValidNationalId) {
        setLoadingButtons(false);
        return;
      }

      const response = await axios.post(
        `${baseUrl}/api/v1/enterprise`,
        {
          name: data.name,
          tinNumber: data.tinNumber,
          type: data.type,
          totalYouthEmployed: data.totalYouthEmployed,
          noOfYouthRefugees: data.noOfYouthRefugees,
          noOfYouthIDPs: data.noOfYouthIDPs,
          noOfYouthPLWDs: data.noOfYouthPLWDs,
          smeCategory: data.smeCategory,
          ownerNationalId: data.ownerNationalId,
          subPartners: data.subPartners,
        },
        {
          headers: { "x-auth-token": token },
        }
      );

      // Success case: Set success message and open modal
      if (response.status === 200 || response.status === 201) {
        setStatusMessage("The Enterprise has been added successfully.");
        setStatusCode(response.status);
        setIsSuccessModalVisible(true); // Show success modal
        reset();
        fetchEnterprise();
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      // Error case: Set error message and open modal
      const customError = error as CustomError;
      setStatusCode(customError?.status || 500);

      if (customError?.status === 409) {
        setStatusMessage(
          "Conflict. An enterprise with the same details already exists."
        );
      } else if (customError?.status === 401) {
        setStatusMessage("Unauthorized access. Please log in.");
      } else if (customError?.status === 403) {
        setStatusMessage(
          "Forbidden. You do not have permission to add a partner."
        );
      } else {
        setStatusMessage("An error occurred. Please try again.");
      }

      setIsSuccessModalVisible(true);
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleModalOk = async () => {
    const formData = getValues();
    await handleFormSubmit(formData);
  };

  const handleSuccessModalOk = () => {
    setIsSuccessModalVisible(false);
    setStatusMessage("");
    setStatusCode(null);
    reset();
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
    <>
      <Modal
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            Add new Enterprise
          </span>
        }
        onOk={handleModalOk}
        styles={styles}
        footer={null}
        visible={isVisible}
        onCancel={onCancel}
        width={800}
      >
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="grid grid-cols-1 gap-4"
        >
          {/* Enterprise Name */}
          <div className="grid gap-5 mb-6 md:grid-cols-2">
            <div className="formlabels">
              <div>
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">*</span>{" "}
                  Enterprise Name
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter Enterprise name"
                        className="border-gray-500 rounded-none border focus:border-gray-500 hover:border-gray-500"
                      />
                      {error && (
                        <p className="text-red-500 text-sm">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">*</span>{" "}
                  TIN Number
                </label>
                <Controller
                  name="tinNumber"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter TIN number"
                        maxLength={9}
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                        }}
                        className="border-gray-500 rounded-none border focus:border-gray-500 hover:border-gray-500"
                      />
                      {error && (
                        <p className="text-red-500 text-sm">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">*</span>{" "}
                  Enterprise Type
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Select
                        {...field}
                        className="border-gray-500 rounded-none border focus:border-gray-500 hover:border-gray-500 w-full"
                        placeholder="Select enterprise type"
                      >
                        <Select.Option value={1}>Formal</Select.Option>
                        <Select.Option value={2}>Informal</Select.Option>
                      </Select>
                      {error && (
                        <p className="text-red-500 text-sm">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">*</span>{" "}
                  Total Youth Employed
                </label>
                <Controller
                  name="totalYouthEmployed"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter total youth employed"
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                        }}
                        className="border-gray-500 rounded-none border focus:border-gray-500 hover:border-gray-500"
                      />
                      {error && (
                        <p className="text-red-500 text-sm">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">*</span>{" "}
                  Number of Youth Refugees
                </label>
                <Controller
                  name="noOfYouthRefugees"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter number of youth refugees"
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                        }}
                        className="border-gray-500 rounded-none border focus:border-gray-500 hover:border-gray-500"
                      />
                      {error && (
                        <p className="text-red-500 text-sm">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>
            <div className="formlabels">
              <div>
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">*</span>{" "}
                  Number of Youth IDPs
                </label>
                <Controller
                  name="noOfYouthIDPs"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter number of youth IDPs"
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                        }}
                        className="border-gray-500 rounded-none border focus:border-gray-500 hover:border-gray-500"
                      />
                      {error && (
                        <p className="text-red-500 text-sm">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">*</span>{" "}
                  Number of Youth PLWDs
                </label>
                <Controller
                  name="noOfYouthPLWDs"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter number of youth PLWDs"
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                        }}
                        className="border-gray-500 rounded-none border focus:border-gray-500 hover:border-gray-500"
                      />
                      {error && (
                        <p className="text-red-500 text-sm">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">*</span>{" "}
                  SME Category
                </label>
                <Controller
                  name="smeCategory"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Select
                        {...field}
                        className="border-gray-500 rounded-none border focus:border-gray-500 hover:border-gray-500 w-full"
                        placeholder="Select sme category"
                      >
                        <Select.Option value={1}>Inviscible</Select.Option>
                        <Select.Option value={2}>Bootstrapers</Select.Option>
                        <Select.Option value={3}>Gazelles</Select.Option>
                      </Select>
                      {error && (
                        <p className="text-red-500 text-sm">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                  <span className="font-bold text-xl text-[#FF0000]">*</span>{" "}
                  Owner National ID
                </label>
                <Controller
                  name="ownerNationalId"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter Owner's National ID"
                        maxLength={16}
                        onBlur={() => {
                          if (field.value.length === 16) {
                            fetchCitizenData(field.value);
                          }
                        }}
                        className="border-gray-500 rounded-none border focus:border-gray-500 hover:border-gray-500"
                      />
                      {error && (
                        <p className="text-red-500 text-sm">{error.message}</p>
                      )}
                      {ownerForeName && ownerSurname && (
                        <span className="text-sm mt-2">
                          Owner Name:
                          <strong className="text-green-600 ">
                            {ownerForeName} {ownerSurname}
                          </strong>{" "}
                        </span>
                      )}
                    </>
                  )}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-[#0C743F] pt-2">
                  Sub Partner
                </label>
                <Controller
                  name="subPartners"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter sub partners"
                        className="border-gray-500 rounded-none border focus:border-gray-500 hover:border-gray-500"
                      />
                      {error && (
                        <p className="text-red-500 text-sm">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex">
            <button
              type="submit"
              disabled={loadingButtons}
              className="bg-[#0C743F] text-white hover:text-[#0C743F] w-full hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
            >
              {loadingButtons ? (
                <>
                  <span>Add Enterprise</span>
                  <Spin
                    className="ml-5"
                    indicator={
                      <LoadingOutlined
                        spin
                        className="text-[#0C743F]  font-extrabold"
                      />
                    }
                  />
                </>
              ) : (
                <span>Add Enterprise</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        visible={isSuccessModalVisible}
        onOk={handleSuccessModalOk}
        onCancel={handleSuccessModalOk}
        styles={styles}
        footer={null}
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
                onClick={handleSuccessModalOk}
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
                onClick={handleSuccessModalOk}
                className="lg:w-[32%] sm:w-full p-5 text-[#FF0000] font-bold rounded-none"
              >
                OK
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default EnterpriseForm;
