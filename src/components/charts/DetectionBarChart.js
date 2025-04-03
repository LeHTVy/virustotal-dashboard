import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DetectionBarChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="empty-chart">No detection data available</div>;
  }

  const latestScan = data[data.length - 1];
  const stats = latestScan.data.attributes.stats || 
                latestScan.data.attributes.last_analysis_stats || 
                {};

  const averages = data.reduce((acc, scan) => {
    const scanStats = scan.data.attributes.stats || 
                     scan.data.attributes.last_analysis_stats || 
                     {};
    
    acc.malicious += (scanStats.malicious || 0);
    acc.suspicious += (scanStats.suspicious || 0);
    acc.harmless += (scanStats.harmless || 0);
    acc.undetected += (scanStats.undetected || 0);
    acc.timeout += (scanStats.timeout || 0);
    return acc;
  }, {
    malicious: 0,
    suspicious: 0,
    harmless: 0,
    undetected: 0,
    timeout: 0
  });

  const count = data.length;
  Object.keys(averages).forEach(key => {
    averages[key] = Math.round(averages[key] / count);
  });

  const chartData = [
    {
      name: 'Current',
      Malicious: stats.malicious || 0,
      Suspicious: stats.suspicious || 0,
      Harmless: stats.harmless || 0,
      Undetected: stats.undetected || 0,
      Timeout: stats.timeout || 0
    },
    {
      name: 'Average',
      Malicious: averages.malicious,
      Suspicious: averages.suspicious,
      Harmless: averages.harmless,
      Undetected: averages.undetected,
      Timeout: averages.timeout
    }
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Malicious" fill="#ef4444" />
        <Bar dataKey="Suspicious" fill="#f59e0b" />
        <Bar dataKey="Harmless" fill="#10b981" />
        <Bar dataKey="Undetected" fill="#6b7280" />
        <Bar dataKey="Timeout" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
}