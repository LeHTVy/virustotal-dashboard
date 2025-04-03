import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function FileTypeChart({ currentScan }) {
  if (!currentScan?.data?.attributes?.results && !currentScan?.data?.attributes?.last_analysis_results) {
    return <div className="empty-chart">No file type data available</div>;
  }

  const fileTypeCounts = {
    executable: 0,
    document: 0,
    archive: 0,
    script: 0,
    other: 0
  };

  try {
    const results = currentScan.data.attributes.results || 
                   currentScan.data.attributes.last_analysis_results || 
                   {};

    Object.values(results).forEach(result => {
      if (result && result.method) {
        const type = getFileType(result.method.toLowerCase());
        fileTypeCounts[type]++;
      }
    });
  } catch (error) {
    console.error('Error processing file types:', error);
    return <div className="empty-chart">Error processing file types</div>;
  }

  const data = [
    { name: 'Executable', value: fileTypeCounts.executable, color: '#8b5cf6' },
    { name: 'Document', value: fileTypeCounts.document, color: '#ef4444' },
    { name: 'Archive', value: fileTypeCounts.archive, color: '#f59e0b' },
    { name: 'Script', value: fileTypeCounts.script, color: '#10b981' },
    { name: 'Other', value: fileTypeCounts.other, color: '#3b82f6' }
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return <div className="empty-chart">No file type data available</div>;
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value
  }) => {
    if (value === 0) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return value > 3 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
      >
        {value}
      </text>
    ) : null;
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name) => [`${value} files`, name]}
        />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function getFileType(method) {
  if (method.includes('exe') || method.includes('pe') || method.includes('dll')) {
    return 'executable';
  }
  if (method.includes('doc') || method.includes('pdf') || method.includes('office') || method.includes('rtf')) {
    return 'document';
  }
  if (method.includes('zip') || method.includes('rar') || method.includes('7z') || method.includes('tar') || method.includes('gz')) {
    return 'archive';
  }
  if (method.includes('script') || method.includes('js') || method.includes('py') || method.includes('bat') || method.includes('sh')) {
    return 'script';
  }
  return 'other';
}