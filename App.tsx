import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Summary from './pages/Summary';
import NewEntry from './pages/NewEntry';
import Settings from './pages/Settings';
import { Page, WaterTestEntry, WeeklyEvaporationLog, TestParameters, CommentLog } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import SuccessOverlay from './components/SuccessOverlay';

// Generate some initial mock data for demonstration for the new detailed structure
const generateInitialWaterData = (): WaterTestEntry[] => {
    const data: WaterTestEntry[] = [];
    for (let i = 15; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
            id: date.getTime().toString(),
            date: date.toISOString().split('T')[0],
            time: `09:${String(10 + i).padStart(2, '0')}`,
            boilerName: i % 2 === 0 ? 'Beel' : 'Cradley',
            boilerStartTime: '24',
            mainGasReading: 12345 + i * 10,
            sulphite: Math.floor(Math.random() * (60 - 20 + 1) + 20),
            alkalinity: Math.floor(Math.random() * (500 - 300 + 1) + 300),
            boilerPh: parseFloat((7.5 + Math.random() * 3).toFixed(1)),
            tdsProbeReadout: 2000 + i * 50,
            tdsLevelCheck: 2010 + i * 50,
            feedWaterHardness: Math.floor(Math.random() * 3),
            feedWaterPh: parseFloat((7.0 + Math.random() * 1.5).toFixed(1)),
            boilerSoftenerHardness: Math.floor(Math.random() * 2),
            boilerSoftenerUnitInService: i % 2 === 0 ? 1 : 2,
            boilerSoftenerLitresUntilRegen: 1500 - i * 10,
            boilerSoftenerSaltBagsAdded: i % 5 === 0 ? 1 : 0,
            condensateHardness: Math.floor(Math.random() * 2),
            condensateTds: 50 + i,
            condensatePh: parseFloat((6.5 + Math.random()).toFixed(1)),
            brewerySoftenerHardness: i % 3 === 0 ? 'Hard' : 'Soft',
            brewerySoftenerUnitInService: i % 2 === 0 ? 2 : 1,
            nalco77211: 5.5,
            nexGuard22310: 3.2,
            waterAdded: 100,
            waterFeedPump: 'Working',
            chemicalDosingPump: 'Working',
            flameDetector: 'Working',
            tdsProbeCheck: 'Checked',
            leftSightGlass: 'Completed',
            rightSightGlass: 'Completed',
            bottomBlowdown: 'Completed',
            tocMonitorChecked: true,
            spotSampleTaken: i % 2 === 0,
            compositeSampleTaken: true,
            commentText: i === 1 ? 'Initial check of the week, all systems nominal.' : undefined,
        });
    }
    return data;
};

const App: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentPage, setCurrentPage] = useState<Page>(Page.Summary);
    const [waterTests, setWaterTests] = useLocalStorage<WaterTestEntry[]>('waterTests', generateInitialWaterData());
    const [weeklyEvaporationLogs, setWeeklyEvaporationLogs] = useLocalStorage<WeeklyEvaporationLog[]>('weeklyEvaporationLogs', []);
    const [commentLogs, setCommentLogs] = useLocalStorage<CommentLog[]>('commentLogs', []);
    const [settings, setSettings] = useLocalStorage<TestParameters>('testParameters', {
        sulphite: { min: 30, max: 50 },
        alkalinity: { min: 350, max: 450 },
        boilerPh: { min: 8.5, max: 9.5 },
        tdsProbeReadout: { min: 1800, max: 2200 },
        tdsLevelCheck: { min: 1800, max: 2200 },
        feedWaterHardness: { min: 0, max: 0 },
        feedWaterPh: { min: 7.0, max: 8.0 },
        boilerSoftenerHardness: { min: 0, max: 0 },
        condensateHardness: { min: 0, max: 0 },
        condensateTds: { min: 0, max: 100 },
        condensatePh: { min: 6.5, max: 7.5 },
        authorizedUsers: [],
        hardness: { max: 0 },
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
    
    const addCommentLog = (entry: Omit<CommentLog, 'id'>) => {
        const newEntry: CommentLog = { ...entry, id: new Date().getTime().toString() };
        setCommentLogs(prev => [...prev, newEntry]);
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
                return <NewEntry onAddWaterTest={addWaterTest} onAddWeeklyEvaporationLog={addWeeklyEvaporationLog} onAddCommentLog={addCommentLog} settings={settings} onSaveSuccess={showSuccessAndRedirect} />;
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