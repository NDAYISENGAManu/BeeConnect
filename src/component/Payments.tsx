import React from "react";
import { Table, Button } from "antd";
import { ColumnsType } from "antd/es/table";
import { EyeOutlined, FilterOutlined } from "@ant-design/icons";

interface Service {
  key: string;
  date: string;
  taxRef: string;
  service: string;
  paidBy: string;
  amount: string;
  paymentMethod: string;
  status: string;
}

const data: Service[] = [
  {
    key: "1",
    date: "2023-06-18",
    taxRef: "AG001",
    service: "service A",
    paidBy: "Name A",
    amount: "30000 Rwf",
    paymentMethod: "U-Pay",
    status: "Active",
  },
  {
    key: "2",
    date: "2023-06-18",
    taxRef: "AG001",
    service: "service B",
    paidBy: "Name B",
    amount: "30000 Rwf",
    paymentMethod: "U-Pay",
    status: "Active",
  },
  {
    key: "3",
    date: "2023-06-18",
    taxRef: "AG001",
    service: "service C",
    paidBy: "Name C",
    amount: "30000 Rwf",
    paymentMethod: "MOMO",
    status: "Active",
  },
];

const Payments: React.FC = () => {
  const columns: ColumnsType<Service> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Tax Ref.",
      dataIndex: "taxRef",
      key: "taxRef",
    },
    {
      title: "Service",
      dataIndex: "service",
      key: "service",
    },
    {
      title: "Paid By",
      dataIndex: "paidBy",
      key: "paidBy",
    },
    {
      title: "amount in Rwf",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span
          className={
            status === "Active"
              ? "status-active"
              : status === "Inactive"
              ? "status-inactive"
              : "status-pending-live"
          }
        >
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <button
          className="text-[#fff] bg-[#0C743F] hover:bg-transparent hover:text-[#0C743F] border w-full"
        >
          <span>
            <EyeOutlined className="" /> View
          </span>
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          <span>Payments</span>
        </h2>
      </div>
      <div className="flex items-center justify-between bg-[#E8E8E8] p-2 mb-4">
        <div className="flex items-center space-x-2 w-full">
          {" "}
          <select className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-1/4">
            <option value="Select by Service">Select by Service</option>
            <option value="Service 1">Service 1</option>
            <option value="Service 2">Service 2</option>
          </select>
          <select className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-1/4">
            <option value="Select by Status">Select by Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select className="bg-white border border-gray-300 text-[#A3A3A3] rounded-none px-2 py-2 w-1/4">
            <option value="Select by Month">Select by Month</option>
            <option value="January">January</option>
            <option value="February">February</option>
          </select>
          <Button className="bg-[#B1B1B1] text-white flex items-center rounded-none py-4 w-1/4">
            {" "}
            <span className="mr-1">
              {" "}
              <FilterOutlined />
            </span>
            Filter
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between my-4">
        <h2 className="text-md font-normal">Showing 1 to 10 of 300 entries</h2>
        <div className="flex items-center">
          <label htmlFor="simple-search" className="font-normal w-full">
            Quick Search
          </label>
          <div className="relative w-full">
            <input
              type="text"
              id="simple-search"
              className="bg-white border-2 border-black text-gray-900 text-sm rounded-md block w-full p-2"
              required
            />
          </div>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        scroll={{ x: "max-content" }}
      />
      <div className="bg-[#F6F6F6] my-2 h-10">&nbsp;</div>
    </>
  );
};

export default Payments;
