import * as React from 'react';
import { WaterTestEntry, WeeklyEvaporationLog, TestParameters, EntryView, CommentLog } from '../types';
import StatusOverview from '../components/StatusOverview';
import RecentTestsTable from '../components/RecentTestsTable';
import TestChart from '../components/TestChart';
import LatestTestDetails from '../components/LatestTestDetails';
import HistoryModal from '../components/HistoryModal';
import DailyTasksOverview from '../components/DailyTasksOverview';

interface SummaryProps {
    waterTestEntries: WaterTestEntry[];
    weeklyEvaporationLogs: WeeklyEvaporationLog[];
    commentLogs: CommentLog[];
    settings: TestParameters;
    setNewEntryTarget: (target: EntryView) => void;
}

const Summary: React.FC<SummaryProps> = ({ waterTestEntries, weeklyEvaporationLogs, commentLogs, settings, setNewEntryTarget }) => {
    const [isHistoryModalOpen, setHistoryModalOpen] = React.useState(false);

    if (waterTestEntries.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-lg shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to Boiler Log!</h2>
                <p className="text-slate-500 mb-8">No water test entries have been recorded yet.</p>
                <button 
                    onClick={() => setNewEntryTarget('waterTest')}
                    className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                    Add Your First Water Test
                </button>
            </div>
        );
    }
    
    const sortedTests = [...waterTestEntries].sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
    const latestTest = sortedTests[0];
    const recentTests = sortedTests.slice(0, 5);
    
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <DailyTasksOverview 
                    waterTestEntries={waterTestEntries} 
                    weeklyEvaporationLogs={weeklyEvaporationLogs} 
                    setNewEntryTarget={setNewEntryTarget} 
                />
                <StatusOverview 
                    latestTest={latestTest} 
                    settings={settings} 
                    setNewEntryTarget={setNewEntryTarget} 
                    commentLogs={commentLogs}
                />
            </div>
            
            <LatestTestDetails test={latestTest} settings={settings} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Sulphite Trend (Last 30 entries)</h3>
                    <TestChart data={sortedTests.slice(0, 30).reverse()} dataKey="sulphite" color="#38bdf8" />
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Alkalinity Trend (Last 30 entries)</h3>
                    <TestChart data={sortedTests.slice(0, 30).reverse()} dataKey="alkalinity" color="#fb923c" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                <div className="flex justify-between items-center p-6">
                    <h3 className="text-lg font-semibold text-slate-800">Recent Water Tests</h3>
                    <button 
                        onClick={() => setHistoryModalOpen(true)} 
                        className="px-4 py-2 bg-white text-sky-600 font-semibold rounded-lg border border-sky-600 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 text-sm"
                    >
                        View Full History
                    </button>
                </div>
                <RecentTestsTable tests={recentTests} settings={settings} />
            </div>

            <HistoryModal 
                isOpen={isHistoryModalOpen} 
                onClose={() => setHistoryModalOpen(false)} 
                allTests={sortedTests} 
                settings={settings}
            />
        </div>
    );
};

export default Summary;