
import * as React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Summary from './pages/Summary';
import NewEntry from './pages/NewEntry';
import Settings from './pages/Settings';
import { Page, WaterTestEntry, WeeklyEvaporationLog, CommentLog, TestParameters, EntryView } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import SuccessOverlay from './components/SuccessOverlay';

// Default settings for the application
const initialSettings: TestParameters = {
  sulphite: { min: 20, max: 50 },
  alkalinity: { min: 150, max: 350 },
  boilerPh: { min: 10.5, max: 11.5 },
  tdsProbeReadout: { min: 0, max: 3500 },
  tdsLevelCheck: { min: 0, max: 3500 },
  feedWaterHardness: { min: 0, max: 5 },
  feedWaterPh: { min: 7, max: 9.5 },
  boilerSoftenerHardness: { min: 0, max: 5 },
  condensateHardness: { min: 0, max: 5 },
  condensateTds: { min: 0, max: 100 },
  condensatePh: { min: 7, max: 9 },
  authorizedUsers: [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
  ],
  hardness: { max: 5 } // Legacy
};


const App: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState<Page>(Page.Summary);
    const [waterTestEntries, setWaterTestEntries] = useLocalStorage<WaterTestEntry[]>('waterTestEntries', []);
    const [weeklyEvaporationLogs, setWeeklyEvaporationLogs] = useLocalStorage<WeeklyEvaporationLog[]>('weeklyEvaporationLogs', []);
    const [commentLogs, setCommentLogs] = useLocalStorage<CommentLog[]>('commentLogs', []);
    const [settings, setSettings] = useLocalStorage<TestParameters>('settings', initialSettings);
    
    const [showSuccessOverlay, setShowSuccessOverlay] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('');
    const [newEntryTarget, setNewEntryTarget] = React.useState<EntryView | null>(null);
    
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const handleSaveSuccess = (message: string) => {
        setSuccessMessage(message);
        setShowSuccessOverlay(true);
        setTimeout(() => {
            setShowSuccessOverlay(false);
            setCurrentPage(Page.Summary);
        }, 2000);
    };
    
    const handleAddWaterTest = (entry: Omit<WaterTestEntry, 'id'>) => {
        const newEntry = { ...entry, id: new Date().toISOString() };
        setWaterTestEntries(prev => [...prev, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)));
    };

    const handleAddWeeklyEvaporationLog = (entry: Omit<WeeklyEvaporationLog, 'id'>) => {
        const newEntry = { ...entry, id: new Date().toISOString() };
        setWeeklyEvaporationLogs(prev => [...prev, newEntry]);
    };
    
    const handleAddCommentLog = (entry: Omit<CommentLog, 'id'>) => {
        const newEntry = { ...entry, id: new Date().toISOString() };
        setCommentLogs(prev => [...prev, newEntry]);
    };
    
    const handleSaveSettings = (newSettings: TestParameters) => {
        setSettings(newSettings);
        handleSaveSuccess('Settings Saved!');
    };
    
    const handleSetNewEntryTarget = (target: EntryView) => {
        setNewEntryTarget(target);
        setCurrentPage(Page.NewEntry);
    }
    
    const clearNewEntryTarget = () => {
        setNewEntryTarget(null);
    }

    const renderPage = () => {
        switch (currentPage) {
            case Page.Summary:
                return <Summary 
                    waterTestEntries={waterTestEntries} 
                    weeklyEvaporationLogs={weeklyEvaporationLogs}
                    settings={settings} 
                    setNewEntryTarget={handleSetNewEntryTarget} 
                />;
            case Page.NewEntry:
                return <NewEntry 
                    onAddWaterTest={handleAddWaterTest} 
                    onAddWeeklyEvaporationLog={handleAddWeeklyEvaporationLog}
                    onAddCommentLog={handleAddCommentLog}
                    settings={settings} 
                    onSaveSuccess={() => handleSaveSuccess('Entry Saved!')}
                    newEntryTarget={newEntryTarget}
                    clearNewEntryTarget={clearNewEntryTarget}
                />;
            case Page.Settings:
                return <Settings settings={settings} onSaveSettings={handleSaveSettings} />;
            default:
                return <Summary 
                    waterTestEntries={waterTestEntries} 
                    weeklyEvaporationLogs={weeklyEvaporationLogs}
                    settings={settings} 
                    setNewEntryTarget={handleSetNewEntryTarget} 
                />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <Sidebar 
                isOpen={isSidebarOpen} 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                closeSidebar={() => setSidebarOpen(false)}
            />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <Header 
                    toggleSidebar={toggleSidebar} 
                    isSidebarOpen={isSidebarOpen} 
                    title={currentPage} 
                />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {renderPage()}
                </main>
            </div>
            <SuccessOverlay isOpen={showSuccessOverlay} message={successMessage} />
        </div>
    );
}

export default App;
