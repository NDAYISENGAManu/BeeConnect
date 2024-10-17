import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number; // Added value
  index: number;
  name: string;
}

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    value, 
    index,
  }: LabelProps) => {
    const xStart = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const yStart = cy + outerRadius * Math.sin(-midAngle * RADIAN);
  
    const xEnd = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
    const yEnd = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);
  
    const lineColors = ["#598DFF", "#7A7EE3", "#A550AC", "#C7C243", "#777777"];
    const lineColor = lineColors[index % lineColors.length];
  
    return (
      <g>
        <line
          x1={xStart}
          y1={yStart}
          x2={xEnd}
          y2={yEnd}
          stroke={lineColor}
          strokeWidth={1}
        />
        <text
          x={xEnd}
          y={yEnd}
          fill={lineColor} 
          textAnchor={xEnd > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {value}
        </text>
      </g>
    );
  };

interface Props {
  data: { name: string; value: number }[];
  colors: string[];
}

const PieChartEducationData: React.FC<Props> = ({ data, colors }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={5}
            label={(props) => renderCustomLabel({ ...props, value: props.payload.value })} // Pass the value to renderCustomLabel
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartEducationData;
