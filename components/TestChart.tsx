

import * as React from 'react';
import { WaterTestEntry } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TestChartProps {
    data: WaterTestEntry[];
    dataKey: keyof WaterTestEntry;
    color: string;
}

const TestChart: React.FC<TestChartProps> = ({ data, dataKey, color }) => {
    const formattedData = data.map(entry => ({
        ...entry,
        name: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart
                    data={formattedData}
                    margin={{
                        top: 5,
                        right: 20,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem' 
                        }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TestChart;