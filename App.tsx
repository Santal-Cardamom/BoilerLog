import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Summary from './pages/Summary';
import NewEntry from './pages/NewEntry';
import Settings from './pages/Settings';
import { Page, WaterTestEntry, WeeklyEvaporationLog, TestParameters } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import SuccessOverlay from './components/SuccessOverlay';

// Generate some initial mock data for demonstration, including out-of-spec values
const generateInitialWaterData = (): WaterTestEntry[] => {
    const data: WaterTestEntry[] = [];
    for (let i = 15; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
            id: date.getTime().toString(),
            date: date.toISOString().split('T')[0],
            time: `09:${String(10 + i).padStart(2, '0')}`,
            // Widen the random range to generate some values outside the default spec
            sulphite: Math.floor(Math.random() * (60 - 20 + 1) + 20), // Default spec: 30-50
            alkalinity: Math.floor(Math.random() * (500 - 300 + 1) + 300), // Default spec: 350-450
            hardness: Math.floor(Math.random() * 3), // Default spec: max 0,
            customFields: {}, // Initialize with empty custom fields
        });
    }
    return data;
};

const App: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentPage, setCurrentPage] = useState<Page>(Page.Summary);
    const [waterTests, setWaterTests] = useLocalStorage<WaterTestEntry[]>('waterTests', generateInitialWaterData());
    const [weeklyEvaporationLogs, setWeeklyEvaporationLogs] = useLocalStorage<WeeklyEvaporationLog[]>('weeklyEvaporationLogs', []);
    const [settings, setSettings] = useLocalStorage<TestParameters>('testParameters', {
        sulphite: { min: 30, max: 50 },
        alkalinity: { min: 350, max: 450 },
        hardness: { max: 0 },
        custom: [],
        authorizedUsers: [],
    });
    const [isSuccessOverlayVisible, setIsSuccessOverlayVisible] = useState(false);

    const showSuccessAndRedirect = () => {
        setIsSuccessOverlayVisible(true);
        setTimeout(() => {
            setIsSuccessOverlayVisible(false);
            setCurrentPage(Page.Summary);
        }, 2500); // Duration for animation + display
    };

    const addWaterTest = (entry: Omit<WaterTestEntry, 'id'>) => {
        const newEntry: WaterTestEntry = { ...entry, id: new Date().getTime().toString() };
        setWaterTests(prev => [...prev, newEntry]);
    };

    const addWeeklyEvaporationLog = (entry: Omit<WeeklyEvaporationLog, 'id'>) => {
        const newEntry: WeeklyEvaporationLog = { ...entry, id: new Date().getTime().toString() };
        setWeeklyEvaporationLogs(prev => [...prev, newEntry]);
    };

    const renderPage = () => {
        switch (currentPage) {
            case Page.Summary:
                return <Summary waterTests={waterTests} settings={settings} />;
            case Page.NewEntry:
                return <NewEntry onAddWaterTest={addWaterTest} onAddWeeklyEvaporationLog={addWeeklyEvaporationLog} settings={settings} onSaveSuccess={showSuccessAndRedirect} />;
            case Page.Settings:
                return <Settings currentSettings={settings} onSettingsSave={setSettings} />;
            default:
                return <Summary waterTests={waterTests} settings={settings} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <SuccessOverlay isOpen={isSuccessOverlayVisible} message="Entry Saved" />
            <Sidebar 
                isOpen={isSidebarOpen} 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                closeSidebar={() => setIsSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col transition-all duration-300" style={{ marginLeft: isSidebarOpen ? '256px' : '80px' }}>
                <Header 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                    isSidebarOpen={isSidebarOpen} 
                    title={currentPage} 
                />
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;