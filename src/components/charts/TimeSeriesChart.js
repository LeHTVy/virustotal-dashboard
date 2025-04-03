import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TimeSeriesChart = ({ data }) => {
  //const chartRef = useRef(null);

  
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="empty-chart">No scan history available</div>;
  }

  const chartData = data.map(scan => {
    const stats = scan.data?.attributes?.stats || 
                 scan.data?.attributes?.last_analysis_stats || 
                 {};
    
    return {
      timestamp: new Date(scan.timestamp).toLocaleTimeString(),
      totalScans: Object.values(stats).reduce((sum, val) => sum + val, 0),
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      undetected: stats.undetected || 0
    };
  });

  return (
    <ResponsiveContainer 
    width="100%" height={240} 
    //key={`timeseries-${data.length}`}
    >
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        //ref={chartRef}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="timestamp"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="totalScans"
          stroke="#8884d8"
          name="Total Scans"
          strokeWidth={2}
          animationDuration={500} 
          animationBegin={0}      
          dot={{ strokeWidth: 2 }} 
        />
        <Line
          type="monotone"
          dataKey="malicious"
          stroke="#ef4444"
          name="Malicious"
          animationDuration={500}
          animationBegin={100}    
          dot={{ strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="suspicious"
          stroke="#f59e0b"
          name="Suspicious"
          animationDuration={500}
          animationBegin={200}
          dot={{ strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="harmless"
          stroke="#10b981"
          name="Harmless"
          animationDuration={500}
          animationBegin={300}
          dot={{ strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="undetected"
          stroke="#6b7280"
          name="Undetected"
          animationDuration={500}
          animationBegin={400}
          dot={{ strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default TimeSeriesChart;