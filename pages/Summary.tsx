
import React from 'react';
import { WaterTestEntry, TestParameters } from '../types';
import TestChart from '../components/TestChart';
import RecentTestsTable from '../components/RecentTestsTable';

interface SummaryProps {
    waterTests: WaterTestEntry[];
    settings: TestParameters;
}

const Summary: React.FC<SummaryProps> = ({ waterTests, settings }) => {
    const last10Tests = waterTests.slice(-10);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Sulphite Levels (ppm)</h3>
                    <TestChart data={waterTests} dataKey="sulphite" color="#38bdf8" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Alkalinity Levels (ppm)</h3>
                    <TestChart data={waterTests} dataKey="alkalinity" color="#fb923c" />
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Last 10 Water Tests</h3>
                <RecentTestsTable tests={last10Tests} settings={settings} />
            </div>
        </div>
    );
};

export default Summary;
