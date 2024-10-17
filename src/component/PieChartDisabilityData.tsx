import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
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

  const lineColors = ["#49AA49", "#103C26"];
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
        fill="black"
        textAnchor={xEnd > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {value}
      </text>
    </g>
  );
};

interface DataItem {
  name: string;
  value: number;
  color: string; // Add a color field to your data type
}

interface Props {
  data: any[];
}

const PieChartDisabilityData: React.FC<Props> = ({ data }) => {
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
            label={renderCustomLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} /> 
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      >
         <svg width="33" height="35" viewBox="0 0 33 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.239 26.2257C18.8917 29.6232 15.6459 31.9868 11.843 32.0116H11.8357C9.97063 32.0117 8.15301 31.4235 6.64151 30.3308C5.13001 29.2381 4.00162 27.6965 3.41691 25.9254C2.8322 24.1543 2.82095 22.244 3.38477 20.4661C3.94858 18.6883 5.05874 17.1335 6.55727 16.0231L6.5806 16.0056L6.06296 12.8108C2.41906 14.8784 9.81845e-07 18.7308 9.81845e-07 23.149C-0.00108375 25.8143 0.896655 28.402 2.54811 30.4939C4.19956 32.5858 6.50821 34.0597 9.1009 34.6774C11.6936 35.295 14.4188 35.0202 16.836 33.8975C19.2532 32.7748 21.2212 30.8697 22.4219 28.4902L22.4525 28.4231L20.239 26.2257Z" fill="#103C26"/>
            <path d="M23.7127 21.9749C23.6063 21.8721 23.4923 21.7776 23.3715 21.6921L23.3628 21.6862C23.0434 21.4675 22.6483 21.3363 22.2225 21.3363H12.991L11.7968 13.977H21.6509C21.8412 13.977 22.0297 13.9395 22.2056 13.8667C22.3814 13.7939 22.5412 13.6871 22.6758 13.5525C22.8104 13.4179 22.9171 13.2581 22.99 13.0823C23.0628 12.9064 23.1003 12.718 23.1003 12.5276C23.1003 12.3373 23.0628 12.1488 22.99 11.973C22.9171 11.7971 22.8104 11.6373 22.6758 11.5028C22.5412 11.3682 22.3814 11.2614 22.2056 11.1886C22.0297 11.1157 21.8412 11.0782 21.6509 11.0782H11.3243L11.1625 10.0984C11.1175 9.83191 11.0205 9.57693 10.8769 9.34798C10.7334 9.11903 10.5461 8.9206 10.3259 8.76401C10.1057 8.60741 9.85677 8.49573 9.59337 8.43534C9.32998 8.37495 9.05728 8.36702 8.79082 8.41202C8.52437 8.45702 8.26939 8.55406 8.04044 8.6976C7.81149 8.84114 7.61306 9.02837 7.45646 9.2486C7.14021 9.69338 7.0136 10.2456 7.10448 10.7837L7.10302 10.772L9.20275 23.6401C9.29742 24.1354 9.55772 24.5837 9.94088 24.9115C10.324 25.2393 10.8073 25.427 11.3112 25.4439H21.3797L29.2668 33.3324C29.4557 33.5289 29.682 33.6858 29.9323 33.7938C30.1826 33.9019 30.4519 33.9589 30.7245 33.9616C30.9971 33.9642 31.2675 33.9125 31.5199 33.8094C31.7723 33.7063 32.0016 33.554 32.1944 33.3612C32.3871 33.1684 32.5395 32.9391 32.6426 32.6867C32.7457 32.4344 32.7974 32.164 32.7947 31.8914C32.7921 31.6187 32.735 31.3494 32.627 31.0991C32.519 30.8488 32.3621 30.6226 32.1656 30.4336L23.7127 21.9749ZM12.189 3.92459C12.189 4.96546 11.7755 5.96369 11.0395 6.69969C10.3035 7.4357 9.3053 7.84918 8.26443 7.84918C7.22357 7.84918 6.22533 7.4357 5.48933 6.69969C4.75333 5.96369 4.33984 4.96546 4.33984 3.92459C4.33984 2.88372 4.75333 1.88549 5.48933 1.14949C6.22533 0.413482 7.22357 0 8.26443 0C9.3053 0 10.3035 0.413482 11.0395 1.14949C11.7755 1.88549 12.189 2.88372 12.189 3.92459Z" fill="#103C26"/>
        </svg>
      </div>
    </div>
  );
};

export default PieChartDisabilityData;
