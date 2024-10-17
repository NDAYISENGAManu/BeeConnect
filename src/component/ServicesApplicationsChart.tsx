import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ServiceData {
  name: string;
  Approved: number;
  Pending: number;
  Rejected: number;
  Requested: number;
}

interface Props {
  serviceData: ServiceData[];
}

const ServicesApplicationsChart: React.FC<Props> = ({ serviceData }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={serviceData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Approved" fill="#82ca9d" />
        <Bar dataKey="Pending" fill="#C7C243" />
        <Bar dataKey="Rejected" fill="#FF4560" />
        <Bar dataKey="Requested" fill="#598DFF" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ServicesApplicationsChart;
