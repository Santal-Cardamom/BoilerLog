import * as React from 'react';
import { WaterTestEntry, WeeklyEvaporationLog, TestParameters, EntryView, CommentLog, ParameterRange } from '../types';
import RecentTestsTable from '../components/RecentTestsTable';
import TestChart from '../components/TestChart';
import LatestTestDetails from '../components/LatestTestDetails';
import HistoryModal from '../components/HistoryModal';
import DailyTasksOverview from '../components/DailyTasksOverview';
import LatestTestStatus from '../components/LatestTestStatus';
import RecentComments from '../components/RecentComments';

interface SummaryProps {
    waterTestEntries: WaterTestEntry[];
    weeklyEvaporationLogs: WeeklyEvaporationLog[];
    commentLogs: CommentLog[];
    settings: TestParameters;
    setNewEntryTarget: (target: EntryView) => void;
}

type ValidatedFields = keyof Omit<TestParameters, 'authorizedUsers' | 'hardness'>;

const getValidationStatus = (
    key: ValidatedFields,
    value: number | undefined | null,
    settings: TestParameters
): 'in-spec' | 'out-of-spec' | 'not-tested' => {
    if (value === null || value === undefined) {
        return 'not-tested';
    }
    const numValue = Number(value);
    const spec = settings[key] as ParameterRange | undefined;
    if (isNaN(numValue) || !spec) {
        return 'not-tested';
    }
    if (numValue >= spec.min && numValue <= spec.max) {
        return 'in-spec';
    }
    return 'out-of-spec';
};

const parametersToCheck: { key: ValidatedFields, name: string }[] = [
    { key: 'sulphite', name: 'Sulphite' },
    { key: 'alkalinity', name: 'Alkalinity' },
    { key: 'boilerPh', name: 'Boiler pH' },
    { key: 'tdsProbeReadout', name: 'TDS Probe' },
    { key: 'tdsLevelCheck', name: 'TDS Level Check' },
    { key: 'feedWaterHardness', name: 'Feed Water Hardness' },
    { key: 'feedWaterPh', name: 'Feed Water pH' },
    { key: 'condensateHardness', name: 'Condensate Hardness' },
];

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
    const recentTests = sortedTests.slice(0, 6);

    const outOfSpecItems = parametersToCheck
        .map(param => ({
            ...param,
            status: getValidationStatus(param.key, latestTest[param.key as keyof WaterTestEntry] as number | undefined, settings),
            value: latestTest[param.key as keyof WaterTestEntry],
            spec: settings[param.key]
        }))
        .filter(item => item.status === 'out-of-spec');
        
    const isNominal = outOfSpecItems.length === 0;
    
    return (
        <div className="space-y-6">
            <DailyTasksOverview 
                waterTestEntries={waterTestEntries} 
                weeklyEvaporationLogs={weeklyEvaporationLogs} 
                setNewEntryTarget={setNewEntryTarget} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={isNominal ? "lg:col-span-1" : "lg:col-span-2"}>
                    <LatestTestStatus outOfSpecItems={outOfSpecItems} />
                </div>
                <div className={isNominal ? "lg:col-span-2" : "lg:col-span-1"}>
                    <RecentComments 
                        commentLogs={commentLogs} 
                        settings={settings}
                        setNewEntryTarget={setNewEntryTarget}
                    />
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
            
            <LatestTestDetails test={latestTest} settings={settings} />

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