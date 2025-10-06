import React, { useState } from 'react';
import { WaterTestEntry, TestParameters } from '../types';
import TestChart from '../components/TestChart';
import RecentTestsTable from '../components/RecentTestsTable';
import HistoryModal from '../components/HistoryModal';
import LatestTestDetails from '../components/LatestTestDetails';

interface SummaryProps {
    waterTests: WaterTestEntry[];
    settings: TestParameters;
}

const Summary: React.FC<SummaryProps> = ({ waterTests, settings }) => {
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const last10Tests = waterTests.slice(-10);
    const latestTest = waterTests.length > 0 ? waterTests[waterTests.length - 1] : null;

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

            {latestTest && (
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Latest Water Test Details</h3>
                    <LatestTestDetails test={latestTest} settings={settings} />
                 </div>
            )}

             <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-700">Last 10 Water Tests</h3>
                    <button 
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                        View Full History
                    </button>
                </div>
                <RecentTestsTable tests={last10Tests} settings={settings} />
            </div>
            
            <HistoryModal 
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                allTests={waterTests}
                settings={settings}
            />
        </div>
    );
};

export default Summary;