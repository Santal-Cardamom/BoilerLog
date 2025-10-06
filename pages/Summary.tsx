import React, { useState } from 'react';
import { WaterTestEntry, TestParameters, WeeklyEvaporationLog, EntryView } from '../types';
import TestChart from '../components/TestChart';
import RecentTestsTable from '../components/RecentTestsTable';
import HistoryModal from '../components/HistoryModal';
import LatestTestDetails from '../components/LatestTestDetails';
import StatusOverview from '../components/StatusOverview';

interface SummaryProps {
    waterTests: WaterTestEntry[];
    weeklyEvaporationLogs: WeeklyEvaporationLog[];
    settings: TestParameters;
    navigateToForm: (targetView: EntryView) => void;
}

const Summary: React.FC<SummaryProps> = ({ waterTests, weeklyEvaporationLogs, settings, navigateToForm }) => {
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [simulatedDate, setSimulatedDate] = useState<string | null>(null);
    
    const last10Tests = waterTests.slice(-10);
    const latestTest = waterTests.length > 0 ? waterTests[waterTests.length - 1] : null;

    return (
        <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <h4 className="text-sm font-bold text-slate-600 mb-2">Time Simulation Tool (For Testing)</h4>
                <div className="flex items-center gap-4">
                    <label htmlFor="simulated-date" className="text-sm font-medium text-slate-500">Simulate Date:</label>
                    <input 
                        type="date" 
                        id="simulated-date"
                        value={simulatedDate || ''}
                        onChange={(e) => setSimulatedDate(e.target.value)}
                        className="p-1 border border-slate-300 rounded-md text-sm text-slate-700"
                    />
                    <button 
                        onClick={() => setSimulatedDate(null)}
                        className="px-3 py-1 bg-slate-500 text-white text-xs font-semibold rounded-lg hover:bg-slate-600"
                    >
                        Reset to Real-Time
                    </button>
                </div>
                {simulatedDate && <p className="text-xs text-amber-600 mt-2">App is currently simulating the date: <strong>{new Date(simulatedDate + 'T12:00:00').toDateString()}</strong></p>}
            </div>

            <StatusOverview 
                waterTests={waterTests} 
                weeklyEvaporationLogs={weeklyEvaporationLogs} 
                navigateToForm={navigateToForm} 
                simulatedDate={simulatedDate ? new Date(simulatedDate + 'T12:00:00') : null}
            />
            
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