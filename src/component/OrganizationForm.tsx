/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Select, Button, Modal, Spin } from "antd";
import axios from "axios";
import { formatPhone } from "../helper/validation.heper";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";
import { LoadingOutlined } from "@ant-design/icons";

const mapDistrictNames = (
  districtIds: string[],
  districtOptions: { label: string; value: string }[]
): string[] => {
  if (!districtIds) return [];
  return districtIds.map((districtId) => {
    const district = districtOptions.find(
      (option) => option.value === districtId
    );
    return district ? district.label : "Unknown district";
  });
};

const mapServiceNames = (
  serviceIds: string[],
  services: { _id: string; name: string }[]
): string[] => {
  if (!serviceIds) return [];
  return serviceIds.map((id) => {
    const service = services.find((service) => service._id === id);
    return service ? service.name : "Unknown service";
  });
};

const validatePhoneNumber = (phoneNumber: string) => {
  const formattedPhone = formatPhone(phoneNumber);
  return formattedPhone ? formattedPhone : null;
};

export const schema = z.object({
  name: z
    .string()
    .min(1, "Organisation name is required")
    .max(100, "Description must be less than 100 characters"),
  type: z.number(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be less than 100 characters"),
  website: z.string().url("Invalid URL"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().refine((val) => validatePhoneNumber(val) !== null, {
    message: "Invalid phone number",
  }),
  owner: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phoneNumber: z.string().refine((val) => validatePhoneNumber(val) !== null, {
      message: "Invalid phone number",
    }),
    nationalId: z
      .string()
      .min(16, "National ID is required")
      .max(16, "National ID is required"),
  }),
  adminInfo: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phoneNumber: z.string().refine((val) => validatePhoneNumber(val) !== null, {
      message: "Invalid phone number",
    }),
    nationalId: z
      .string()
      .min(16, "National ID is required")
      .max(16, "National ID is required"),
  }),
  coveredDistricts: z.array(z.string()).optional(),
  servicesProvided: z.array(z.string()).optional(),
  tinNumber: z.string().min(1, "Tin number is required").optional(),
});

type FormData = z.infer<typeof schema>;

interface PartnerFormProps {
  services: { _id: string; name: string }[];
  fetchData: () => void;
  onPartnerAdded: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({
  services,
  fetchData,
  onPartnerAdded,
}) => {
  const {
    control,
    watch,
    handleSubmit,
    setValue,
    setError,
    getValues,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      servicesProvided: [],
    },
  });

  const [districtOptions, setDistrictOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const watchFields = watch();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const [selectedType, setSelectedType] = useState<number>(1);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState<FormData | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [statusCode, setStatusCode] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadingOwner, setLoadingOwner] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/v1/geomap/upper`, {
          headers: { "x-auth-token": token },
        });
        const regions = response.data.data;
        const districts = regions.flatMap((region: any) => region.districts);
        const districtOptions = districts.map((district: any) => ({
          label: district.name,
          value: district._id,
        }));
        setDistrictOptions(districtOptions);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };

    fetchDistricts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capitalizeMessage = (message: string) => {
    return message.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleSubmitPartner = async (formData: FormData): Promise<void> => {
    setLoading(true);

    setStatusCode(0);
    setStatusMessage("");

    // Clear previous errors
    clearErrors();

    try {
      // Prepare request data
      setStatusMessage("");
      const requestData: any = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        website: formData.website,
        email: formData.email,
        phoneNumber: formatPhone(formData.phoneNumber),
        owner: {
          ...formData.owner,
          phoneNumber: formatPhone(formData.owner.phoneNumber),
        },
        adminInfo: {
          ...formData.adminInfo,
          phoneNumber: formatPhone(formData.adminInfo.phoneNumber),
        },
        tinNumber: formData.tinNumber || undefined,
      };

      if (formData.coveredDistricts?.length) {
        requestData.coveredDistricts = formData.coveredDistricts.map(
          (districtId) => {
            const district = districtOptions.find(
              (d) => d.value === districtId
            );
            return {
              _id: district?.value,
              name: district?.label,
            };
          }
        );
      }

      if (formData.servicesProvided?.length) {
        requestData.servicesProvided = formData.servicesProvided.map(
          (service) => ({
            _id: service,
            name: services.find((s) => s._id === service)?.name,
          })
        );
      }

      // Submit data to the server
      const response = await axios.post(
        `${baseUrl}/api/v1/organization`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log("Success response received");
        setStatusMessage("The Partner has been added successfully.");
        setStatusCode(response.status);
        setIsSuccessModalVisible(true);
      }
      setIsSuccessModalVisible(true);
    } catch (error: any) {
      let errorMessage = "An error occurred. Please try again.";

      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data;

        if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.errors && typeof apiError.errors === "object") {
          Object.keys(apiError.errors).forEach((key) => {
            const field = key as keyof FormData;
            setError(field, {
              type: "server",
              message: apiError.errors[key],
            });
          });
        }
        setStatusCode(error.response.status || 500);
      } else {
        setStatusCode(500);
      }

      setStatusMessage(capitalizeMessage(errorMessage));
      setIsSuccessModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuccessModalVisible && statusCode === 200) {
      console.log("Success Modal is visible with status code:", statusCode);
    }
  }, [isSuccessModalVisible, statusCode]);

  const fetchCitizenData = async (nationalId: string) => {
    setLoadingAdmin(true);
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/user/citizen`,
        { nationalId },
        {
          headers: { "x-auth-token": token },
        }
      );

      const { nidExists, foreName, surname } = response.data.data;

      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (nidExists) {
        setError("adminInfo.nationalId", {
          type: "manual",
          message: "National ID has been used.",
        });
      } else {
        setValue("adminInfo.firstName", foreName);
        setValue("adminInfo.lastName", surname);
        clearErrors("owner.nationalId");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setError("adminInfo.nationalId", {
          type: "manual",
          message: "National ID not found.",
        });
      } else {
        setError("adminInfo.nationalId", {
          type: "manual",
          // message: "Error fetching data. Please try again.",
        });
      }
    } finally {
      setLoadingAdmin(false);
    }
  };

  const fetchOwnerIData = async (nationalId: string) => {
    setLoadingOwner(true);
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/user/citizen`,
        { nationalId },
        {
          headers: { "x-auth-token": token },
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const { nidExists, foreName, surname } = response.data.data;

      if (nidExists) {
        setError("owner.nationalId", {
          type: "manual",
          message: "National ID has been used.",
        });
      } else {
        setValue("owner.firstName", foreName);
        setValue("owner.lastName", surname);
        clearErrors("owner.nationalId");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setError("owner.nationalId", {
          type: "manual",
          message: "National ID not found.",
        });
      } else {
        setError("owner.nationalId", {
          type: "manual",
          // message: "Error fetching data. Please try again.",
        });
      }
    } finally {
      setLoadingOwner(false);
    }
  };

  const districtNames = mapDistrictNames(
    watchFields.coveredDistricts || [],
    districtOptions
  );
  const serviceNames = mapServiceNames(
    watchFields.servicesProvided || [],
    services
  );

  const handlePreview = () => {
    clearErrors();
    const formData = getValues();
    setPreviewData(formData);
    setIsModalVisible(true);
  };

  const handleCancelPreview = () => {
    setIsModalVisible(false);
  };

  const handleSuccessMessage = () => {
    setIsSuccessModalVisible(false);
    if (statusCode === 200 || statusCode === 201) {
      fetchData();
      onPartnerAdded();
    }
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    handleSubmitPartner(previewData!);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setLoading(false);
    setIsModalVisible(false);
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
    <div>
      <p style={{ textAlign: "left" }} className="py-2">
        Please provide the following required information to add a partner
      </p>
      <FormProvider>
        <form onSubmit={handleSubmit(handlePreview)}>
          <div className="grid gap-6 mb-6 md:grid-cols-3">
            <div className="formlabels">
              <h2 className="font-bold text-lg">Main Info</h2>
              {/* Organisation Names */}
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                Organisation Names
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter organisation name"
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                Organisation Type
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <div>
                    <Select
                      {...field}
                      className="h-10 w-full bg-white rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                      placeholder="Select Organization"
                      onChange={(value) => {
                        setSelectedType(value);
                        field.onChange(value);
                      }}
                    >
                      <Select.Option value={1}>BeeConnect</Select.Option>
                      <Select.Option value={2}>PARTNER</Select.Option>
                    </Select>
                  </div>
                )}
              />
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter description"
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                Website
              </label>
              <Controller
                name="website"
                control={control}
                rules={{
                  required: "Website URL is required",
                  pattern: {
                    value:
                      /^(https?:\/\/)?([^\s@]+@[^\s@]+\.[^\s@]+|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/,
                    message: "Please enter a valid website URL",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter website URL"
                      onBlur={() => {
                        let value = field.value.trim();
                        if (value && !/^https?:\/\//i.test(value)) {
                          value = `https://${value}`;
                        }
                        field.onChange(value);
                        field.onBlur();
                      }}
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                Email
              </label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter email"
                      onBlur={() => field.onBlur()}
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                Phone Number
              </label>
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^\d{1,12}$/,
                    message:
                      "Phone number must be up to 12 digits and contain no letters or special characters",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter phone number"
                      maxLength={12}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                      onBlur={() => field.onBlur()}
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                {selectedType === 2 && (
                  <span className="font-bold text-xl text-[#FF0000]">* </span>
                )}
                Covered Districts
              </label>
              <Controller
                name="coveredDistricts"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Select
                      {...field}
                      mode="multiple"
                      placeholder="Select covered districts"
                      className="mb-2 rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                      style={{ width: "100%", borderRadius: "0px" }}
                      options={districtOptions}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                Services Provided
              </label>
              <Controller
                name="servicesProvided"
                control={control}
                render={({ field }) => (
                  <Select
                    mode="multiple"
                    placeholder="Select services provided"
                    className="mb-2 rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
                    style={{ width: "100%" }}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    {services.map((service) => (
                      <Select.Option key={service._id} value={service._id}>
                        {service.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              />
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                Tin Number
              </label>
              <Controller
                name="tinNumber"
                control={control}
                rules={{
                  required: "TIN number is required",
                  pattern: {
                    value: /^\d{9}$/,
                    message: "TIN number must be exactly 9 digits",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter TIN Number"
                      maxLength={9}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                      onBlur={() => field.onBlur()}
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
            {/* Owner Details */}
            <div className="formlabels">
              <h2 className="font-bold text-lg">Owner Info</h2>
              {/* National ID */}
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                National ID
              </label>
              <Controller
                name="owner.nationalId"
                control={control}
                rules={{
                  required: "National ID is required",
                  pattern: {
                    value: /^\d{16}$/,
                    message: "National ID must be exactly 16 digits",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      id="owner.nationalId"
                      placeholder="Enter national ID"
                      maxLength={16}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                      onBlur={() => fetchOwnerIData(field.value)}
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                      suffix={
                        loadingOwner ? (
                          <Spin
                            indicator={
                              <LoadingOutlined
                                style={{ fontSize: 24, color: "#0C743F" }}
                                spin
                              />
                            }
                          />
                        ) : null
                      }
                    />
                    {fieldState.error && (
                      <p className="error-message text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* First Name */}
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                First Name
              </label>
              <Controller
                name="owner.firstName"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter first name"
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                      readOnly
                      disabled
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              {/* Last Name */}
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                Last Name
              </label>
              <Controller
                name="owner.lastName"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter last name"
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                      readOnly
                      disabled
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              {/* Owner Email */}
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                Owner Email
              </label>
              <Controller
                name="owner.email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter email"
                      onBlur={() => field.onBlur()}
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              {/* Owner Phone Number */}
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                Phone Number
              </label>
              <Controller
                name="owner.phoneNumber"
                control={control}
                rules={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^\d{1,12}$/,
                    message:
                      "Phone number must be up to 12 digits and contain no letters or special characters",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter phone number"
                      maxLength={12}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                      onBlur={() => field.onBlur()}
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
            {/* Admin Details */}
            <div className="formlabels">
              <h2 className="font-bold text-lg">Admin Info</h2>
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                National ID
              </label>
              <Controller
                name="adminInfo.nationalId"
                control={control}
                rules={{
                  required: "National ID is required",
                  pattern: {
                    value: /^\d{16}$/,
                    message: "National ID must be exactly 16 digits",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      id="adminInfo.nationalId"
                      placeholder="Enter national ID"
                      maxLength={16}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                      onBlur={() => {
                        if (field.value.length === 16) {
                          fetchCitizenData(field.value);
                        } else {
                          setError("adminInfo.nationalId", {
                            type: "manual",
                            message: "National ID must be exactly 16 digits",
                          });
                        }
                      }}
                      suffix={
                        loadingAdmin ? (
                          <Spin
                            indicator={
                              <LoadingOutlined
                                style={{ fontSize: 24, color: "#0C743F" }}
                                spin
                              />
                            }
                          />
                        ) : null
                      }
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                    />
                    {fieldState.error && (
                      <p className="error-message text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                First Name
              </label>
              <Controller
                name="adminInfo.firstName"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter first name"
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                      readOnly
                      disabled
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              {/* Last Name */}
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                Last Name
              </label>
              <Controller
                name="adminInfo.lastName"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter last name"
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                      readOnly
                      disabled
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              {/* Admin Email */}
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                Admin Email
              </label>
              <Controller
                name="adminInfo.email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter email"
                      onBlur={() => field.onBlur()}
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              {/* Admin Phone Number */}
              <label className="block mb-2 text-sm font-bold text-[#0C743F]">
                <span className="font-bold text-xl text-[#FF0000]">* </span>
                Phone Number
              </label>
              <Controller
                name="adminInfo.phoneNumber"
                control={control}
                rules={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^\d{1,12}$/,
                    message:
                      "Phone number must be up to 12 digits and contain no letters or special characters",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Enter phone number"
                      maxLength={12}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                      onBlur={() => field.onBlur()}
                      className="mb-2 h-10 w-full rounded-none border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500 px-4 py-2"
                    />
                    {fieldState.error && (
                      <span className="text-red-500">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
              <div className="flex items-center justify-between my-5 gap-3">
                <div className="flex w-full">
                  <button
                    type="submit"
                    className="bg-[#0C743F] text-white px-6 py-3 my-2 font-semibold hover:bg-[#0A6132] w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span>Loading...</span>
                        <Spin
                          className="ml-2"
                          indicator={<LoadingOutlined spin />}
                        />
                      </>
                    ) : (
                      "CONFIRM"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
      <Modal
        title={
          <span style={{ color: "#0C743F", fontSize: "20px" }}>
            Preview Entered Data
          </span>
        }
        visible={isModalVisible}
        onCancel={handleCancelPreview}
        footer={null}
        width={1000}
        styles={styles}
      >
        {previewData && (
          <div>
            <div className="flex items-center justify-between mb-6 font-bold">
              <div className="formlabels w-[32%]">
                <p>
                  <strong>Organization Name:</strong> {previewData.name}
                </p>
                <p>
                  <strong>Organization Type:</strong>{" "}
                  {previewData.type === 1 ? "BeeConnect" : "PARTNER"}
                </p>
                <p>
                  <strong>Description:</strong> {previewData.description}
                </p>
                <p>
                  <strong>Website:</strong> {previewData.website}
                </p>
                <p>
                  <strong>Email:</strong> {previewData.email}
                </p>
                <p>
                  <strong>Phone Number:</strong> {previewData.phoneNumber}
                </p>
                <p>
                  <strong>Covered Districts:</strong> {districtNames.join(", ")}
                </p>
                <p>
                  <strong>Services Provided:</strong> {serviceNames.join(", ")}
                </p>
                <p>
                  <strong>TIN Number:</strong> {previewData.tinNumber || "N/A"}
                </p>
              </div>
              <div className="formlabels w-[32%] h-100vh">
                <p>Owner Information:</p>
                <p>
                  <strong>First Name:</strong> {previewData.owner.firstName}
                </p>
                <p>
                  <strong>Last Name: </strong>
                  {previewData.owner.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {previewData.owner.email}
                </p>
                <p>
                  <strong>Phone Number:</strong> {previewData.owner.phoneNumber}
                </p>
                <p>
                  <strong>National ID: </strong>
                  {previewData.owner.nationalId}
                </p>
              </div>
              <div className="formlabels w-[32%]">
                <p>Admin Information:</p>
                <p>
                  <strong>First Name:</strong> {previewData.adminInfo.firstName}
                </p>
                <p>
                  <strong>Last Name:</strong> {previewData.adminInfo.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {previewData.adminInfo.email}
                </p>
                <p>
                  <strong>Phone Number:</strong>{" "}
                  {previewData.adminInfo.phoneNumber}
                </p>
                <p>
                  <strong>National ID:</strong>{" "}
                  {previewData.adminInfo.nationalId}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Button
            key="cancel"
            onClick={handleCancelPreview}
            className="lg:w-[32%] sm:w-full p-5 text-[#757575] font-bold rounded-none"
          >
            OK
          </Button>
          <Button
            key="ok"
            onClick={handleConfirmSubmit}
            className="lg:w-[32%] sm:w-full p-5 bg-[#0C743F] text-white font-bold rounded-none"
            disabled={loading}
          >
            {loading ? (
              <>
                <span>CONFIRM</span>{" "}
                <Spin className="ml-2" indicator={<LoadingOutlined spin />} />
              </>
            ) : (
              "CONFIRM"
            )}
          </Button>
        </div>
      </Modal>
      <Modal
        visible={isSuccessModalVisible}
        onCancel={() => setIsSuccessModalVisible(false)}
        footer={null}
        centered
        maskStyle={styles.mask}
        bodyStyle={styles.body}
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
                onClick={handleSuccessMessage}
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
                onClick={handleSuccessMessage}
                className="lg:w-[32%] sm:w-full p-5 text-[#FF0000] font-bold rounded-none"
              >
                OK
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PartnerForm;
