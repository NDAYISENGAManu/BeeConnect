/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { Collapse, Checkbox, Button, Spin, Modal } from "antd";
import axios from "axios";
import { api } from "../api";
import { LoadingOutlined } from "@ant-design/icons";
import success from "../assets/success.svg";
import icoerror from "../assets/ico_error.svg";
import { Policy } from "../types/globalData";

const Permission: React.FC = () => {
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [policies, setPolicies] = useState<Record<string, string[]>>({});
  const [userPolicies, setUserPolicies] = useState<string[]>([]);
  const [policyId, setPolicyId] = useState<string | null>(null);
  const [searchablePolicies, setSearchablePolicies] = useState<string[]>([]);
  const [checkedPolicies, setCheckedPolicies] = useState<Set<string>>(
    new Set()
  );
  const checkboxRefs = useRef<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [loadingButtons, setLoadingButtons] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    fetchAllPolicies();
  }, []);

  const fetchAllPolicies = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/v1/policy/list");
      const data = response.data.data;
      const mergedPolicies: Array<string> = [];
      const transformedPolicies: Record<string, string[]> = {};
      Object.keys(data).forEach((category) => {
        transformedPolicies[category] = Object.keys(data[category]);
        mergedPolicies.push(...Object.keys(data[category]));
      });
      setSearchablePolicies(mergedPolicies);
      setTimeout(() => {
        setPolicies(transformedPolicies);
        setLoading(false);
      }, 3000);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchPolicies = async (orgType: number, role: number) => {
    // fetch policies owned by a user with specific role in the organization
    setLoading(true);
    try {
      const response = await api.get(
        `/api/v1/policy/orgType/${orgType}/role/${role}`
      );
      const policy: Policy = response.data.data;
      if (policy && policy.orgType === orgType && policy.role === role) {
        setUserPolicies(policy.accesses || []);
        checkboxRefs.current = {
          ...checkboxRefs.current,
          [policy._id]: policy.accesses,
        };
        setPolicyId(policy._id);
        setCheckedPolicies(new Set(policy.accesses));
      } else {
        setUserPolicies([]);
        checkboxRefs.current = {};
        setPolicyId(null);
        setCheckedPolicies(new Set());
      }
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleOrgChange = (value: number) => {
    setSelectedOrg(value);
    if (selectedRole !== null) {
      fetchPolicies(value, selectedRole);
    }
  };

  const handleRoleChange = (value: number) => {
    setSelectedRole(value);
    if (selectedOrg !== null) {
      fetchPolicies(selectedOrg, value);
    }
  };

  const handlePolicyChange = (category: string, checkedValues: string[]) => {
    const updatedUserPolicies = {
      ...checkboxRefs.current,
      [category]: checkedValues,
    };
    const allSelectedPolicies = Object.values(updatedUserPolicies).flat();
    setCheckedPolicies((prev) => {
      const updatedSet = new Set(prev);
      policies[category].forEach((policy) => updatedSet.delete(policy));
      checkedValues.forEach((value) => updatedSet.add(value));
      return updatedSet;
    });

    setUserPolicies(allSelectedPolicies);
    checkboxRefs.current = updatedUserPolicies;
  };

  useEffect(() => {
    if (selectedOrg !== null && selectedRole !== null) {
      fetchPolicies(selectedOrg, selectedRole);
    }
  }, [selectedOrg, selectedRole]);

  const handleSavePolicies = async () => {
    setLoadingButtons(true);

    if (selectedOrg === null || selectedRole === null) {
      setStatusCode(400);
      setStatusMessage(
        "Please select organization, role, and ensure the policy exists."
      );
      setIsSuccessModalVisible(true);
      setLoadingButtons(false);
      return;
    }

    // Get the current state of checked policies
    const uniquePolicies = Array.from(checkedPolicies).filter((policy) =>
      searchablePolicies.includes(policy)
    );

    try {
      let response;
      if (!policyId) {
        response = await api.post("/api/v1/policy", {
          orgType: selectedOrg,
          role: selectedRole,
          accesses: uniquePolicies,
        });
      } else {
        response = await api.put(`/api/v1/policy/id/${policyId}`, {
          accesses: uniquePolicies,
        });
      }

      const status = response.status;
      setStatusCode(status);

      if (status === 200 || status === 201) {
        setStatusMessage("Policies updated successfully!");
      } else {
        setStatusMessage("Failed to update policies!");
      }
      setLoadingButtons(false);
      setIsSuccessModalVisible(true);
      setIsModalVisible(false);
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";

      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data;

        if (
          apiError &&
          apiError.error &&
          typeof apiError.error.message === "string"
        ) {
          errorMessage = apiError.error.message;
        } else if (typeof apiError.message === "string") {
          errorMessage = apiError.message;
        }

        setStatusCode(error.response?.status || 500);
      } else {
        setStatusCode(500);
        errorMessage = "An unexpected error occurred.";
      }

      setStatusMessage(errorMessage);
      setLoadingButtons(false);
      setIsSuccessModalVisible(true);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSuccessModalOk = () => {
    setIsSuccessModalVisible(false);
  };

  const styles = {
    mask: {
      backgroundColor: "#0C743FC9",
    },
    body: {
      borderRadius: "0 !important",
    },
  };

  const formatString = (str: string) => {
    str = str.replace(/_/g, " ");
    str = str.replace(/([a-z])([A-Z])/g, "$1 $2");
    return str
      .split(" ")
      .map((word) => {
        if (word.toLowerCase() === "sms") {
          return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-md lg:text-xl font-bold">Policies</h2>
      </div>
      <div className="flex flex-col w-full md:flex-row md:justify-between gap-3 bg-[#F6F6F6] p-4">
        <div className="flex flex-col w-full md:w-[32%]">
          <select
            className="mb-2 h-10 w-full rounded-none bg-white px-3 border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
            onChange={(e) => handleOrgChange(parseInt(e.target.value))}
            value={selectedOrg || ""}
          >
            <option value="" disabled>
              Select Partner
            </option>
            <option value={1}>AGRA</option>
            <option value={2}>PARTNER</option>
          </select>
        </div>
        <div className="flex flex-col w-full md:w-[32%]">
          <select
            className="mb-2 h-10 w-full rounded-none bg-white px-3 border border-gray-500 focus:border-gray-500 hover:border-gray-500 after:border-gray-500 before:border-gray-500"
            onChange={(e) => handleRoleChange(parseInt(e.target.value))}
            value={selectedRole || ""}
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value={1}>SUPER ADMIN</option>
            <option value={2}>ADMIN</option>
            <option value={3}>NORMAL USER</option>
          </select>
        </div>
        <div className="flex flex-col w-full md:w-[36%] border-1 border-gray-500">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin
                className="ml-5"
                indicator={
                  <LoadingOutlined
                    spin
                    className=" text-[#000] font-extrabold"
                  />
                }
              />
            </div>
          ) : (
            <Collapse accordion className="rounded-none border border-gray-500">
              {Object.entries(policies).map(([category, policyList]) => (
                <Collapse.Panel header={formatString(category)} key={category}>
                  <Checkbox.Group
                    value={Array.from(checkedPolicies)}
                    onChange={(checkedValues) =>
                      handlePolicyChange(category, checkedValues as string[])
                    }
                  >
                    <div>
                      {policyList.map((policy) => (
                        <Checkbox
                          key={policy}
                          value={policy}
                          className="border-[#000] border-1 flex"
                        >
                          {formatString(policy)}
                        </Checkbox>
                      ))}
                    </div>
                  </Checkbox.Group>
                </Collapse.Panel>
              ))}
            </Collapse>
          )}
        </div>
      </div>
      <div className="flex my-4">
        <button
          onClick={showModal}
          className="bg-[#0C743F] text-white hover:text-[#0C743F] px-5 hover:bg-white border hover:border-[#0C743F] rounded-none p-2 my-2 transition-colors font-bold"
          disabled={loadingButtons}
        >
          {loadingButtons ? (
            <>
              <span>Save Policies</span>
              <Spin
                className="ml-5"
                indicator={
                  <LoadingOutlined
                    spin
                    className=" text-green-600 font-extrabold"
                  />
                }
              />
            </>
          ) : (
            <span>Save Policies</span>
          )}
        </button>
      </div>
      <Modal
        visible={isModalVisible}
        title={
          <span style={{ color: "#008532" }}>
            Confirm policies changes for:
          </span>
        }
        footer={null}
        closeIcon={null}
        styles={styles}
      >
        <p>
          <strong>Organization:</strong>{" "}
          {selectedOrg === 1 ? "AGRA" : "PARTNER"}
        </p>
        <p>
          <strong>Role:</strong>{" "}
          {selectedRole === 1
            ? "SUPER ADMIN"
            : selectedRole === 2
            ? "ADMIN"
            : "NORMAL USER"}
        </p>
        <p>
          <strong>Accesses:</strong>
        </p>
        <ul>
          {userPolicies.map((access) => {
            const isChecked = checkedPolicies.has(access);
            return (
              <li key={access} style={{ color: isChecked ? "black" : "red" }}>
                {access}
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between">
          <Button
            key="cancel"
            onClick={handleCancel}
            className="lg:w-[32%] sm:w-full p-5 text-[#757575] font-bold rounded-none"
          >
            Cancel
          </Button>
          <Button
            key="ok"
            onClick={handleSavePolicies}
            className="lg:w-[32%] sm:w-full p-5 bg-[#0C743F] text-white font-bold rounded-none"
          >
            Confirm
          </Button>
        </div>
      </Modal>

      <Modal
        visible={isSuccessModalVisible}
        onOk={handleSuccessModalOk}
        styles={styles}
        footer={null}
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

export default Permission;
