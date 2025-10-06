import * as React from 'react';
import { WaterTestEntry, WeeklyEvaporationLog, EntryView } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/ClockIcon';

interface DailyTasksOverviewProps {
    waterTestEntries: WaterTestEntry[];
    weeklyEvaporationLogs: WeeklyEvaporationLog[];
    setNewEntryTarget: (target: EntryView) => void;
}

type TaskStatus = 'pending' | 'completed';
interface TaskBoxProps {
    title: string;
    status: TaskStatus;
    completedAt: Date | null;
    onClick: () => void;
}

const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const TaskBox: React.FC<TaskBoxProps> = ({ title, status, completedAt, onClick }) => {
    const statusConfig = {
        pending: {
            className: 'animate-pulse-amber',
            icon: <ClockIcon className="h-6 w-6 text-amber-500" />,
            text: 'Pending',
            textColor: 'text-amber-700'
        },
        completed: {
            className: 'bg-green-50 border-green-300',
            icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
            text: 'Completed',
            textColor: 'text-green-700'
        }
    };

    const config = statusConfig[status];

    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-lg shadow-md border w-full h-full flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${config.className}`}
        >
            <h4 className="font-bold text-slate-800 text-base">{title}</h4>
            <div className="mt-2 flex flex-col items-center">
                {config.icon}
                <span className={`mt-1 font-semibold text-sm ${config.textColor}`}>{config.text}</span>
                {completedAt && (
                    <p className="text-xs text-slate-500 mt-1">
                        {completedAt.toLocaleDateString()} @ {completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </div>
        </button>
    );
};


const DailyTasksOverview: React.FC<DailyTasksOverviewProps> = ({ waterTestEntries, weeklyEvaporationLogs, setNewEntryTarget }) => {
    const [now, setNow] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const dailyWaterTestStatus = React.useMemo(() => {
        const todayStr = getLocalDateString(now);
        const latestTestToday = waterTestEntries
            .filter(e => e.date === todayStr)
            .sort((a, b) => b.time.localeCompare(a.time))
            [0];
        
        return {
            completed: !!latestTestToday,
            timestamp: latestTestToday ? new Date(`${latestTestToday.date}T${latestTestToday.time}`) : null
        };
    }, [now, waterTestEntries]);

    const dailyBlowdownStatus = React.useMemo(() => {
        const todayStr = getLocalDateString(now);
        const latestBlowdownToday = waterTestEntries
            .filter(e => e.date === todayStr && e.leftSightGlass === 'Completed' && e.rightSightGlass === 'Completed' && e.bottomBlowdown === 'Completed')
            .sort((a, b) => b.time.localeCompare(a.time))
            [0];
            
        return {
            completed: !!latestBlowdownToday,
            timestamp: latestBlowdownToday ? new Date(`${latestBlowdownToday.date}T${latestBlowdownToday.time}`) : null
        };
    }, [now, waterTestEntries]);

    const weeklyEvapStatus = React.useMemo(() => {
        const dayOfWeek = now.getDay(); // 0 for Sunday
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const latestWeeklyLog = weeklyEvaporationLogs
             .sort((a, b) => new Date(b.formFinishedAt).getTime() - new Date(a.formFinishedAt).getTime())
             [0];

        const completed = latestWeeklyLog && new Date(latestWeeklyLog.testDate + 'T00:00:00') >= startOfWeek;
        
        return {
            completed,
            timestamp: completed ? new Date(latestWeeklyLog.formFinishedAt) : null
        };
    }, [now, weeklyEvaporationLogs]);


    return (
        <>
            <style>{`
                @keyframes pulse-amber {
                    50% { background-color: #fde68a; }
                }
                .animate-pulse-amber {
                    background-color: #fef3c7;
                    border-color: #fcd34d;
                    animation: pulse-amber 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
            <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TaskBox 
                        title="Daily Boiler Water Test" 
                        status={dailyWaterTestStatus.completed ? 'completed' : 'pending'}
                        completedAt={dailyWaterTestStatus.timestamp}
                        onClick={() => setNewEntryTarget('waterTest')}
                    />
                    <TaskBox 
                        title="Daily Blowdown Test" 
                        status={dailyBlowdownStatus.completed ? 'completed' : 'pending'}
                        completedAt={dailyBlowdownStatus.timestamp}
                        onClick={() => setNewEntryTarget('dailyBlowdown')}
                    />
                    <TaskBox 
                        title="Weekly Evaporation Test" 
                        status={weeklyEvapStatus.completed ? 'completed' : 'pending'}
                        completedAt={weeklyEvapStatus.timestamp}
                        onClick={() => setNewEntryTarget('weeklyEvaporation')}
                    />
                </div>
            </div>
        </>
    );
};

export default DailyTasksOverview;