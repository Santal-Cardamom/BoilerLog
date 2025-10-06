import React from 'react';
import { WaterTestEntry, WeeklyEvaporationLog, EntryView } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ClockIcon } from './icons/ClockIcon';

interface StatusOverviewProps {
    waterTests: WaterTestEntry[];
    weeklyEvaporationLogs: WeeklyEvaporationLog[];
    navigateToForm: (targetView: EntryView) => void;
    simulatedDate?: Date | null;
}

type Status = 'completed' | 'pending' | 'warning';

interface StatusCardProps {
    title: string;
    status: Status;
    completedAt?: string;
    onClick: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, status, completedAt, onClick }) => {
    const baseClasses = "flex flex-col items-center justify-center p-4 rounded-lg shadow-md transition-all duration-300 w-full";
    
    const statusConfig = {
        completed: {
            bg: 'bg-green-50 hover:bg-green-100',
            border: 'border-green-500',
            text: 'text-green-800',
            icon: <CheckCircleIcon className="h-8 w-8 text-green-500" />,
            message: 'Completed:'
        },
        pending: {
            bg: 'bg-white hover:bg-slate-50',
            border: 'border-slate-300',
            text: 'text-slate-500',
            icon: <ClockIcon className="h-8 w-8 text-slate-400" />,
            message: 'Pending'
        },
        warning: {
            bg: 'bg-amber-50 hover:bg-amber-100',
            border: 'border-amber-500 animate-flash-amber',
            text: 'text-amber-800',
            icon: <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" />,
            message: 'Due Soon'
        }
    };

    const config = statusConfig[status];

    return (
        <button onClick={onClick} className={`${baseClasses} ${config.bg} border ${config.border}`}>
            <style>{`
                @keyframes flash-amber {
                    50% { border-color: transparent; }
                }
                .animate-flash-amber {
                    animation: flash-amber 2s ease-in-out infinite;
                }
            `}</style>
            <div className="flex items-center justify-center w-full">
                {config.icon}
                <h3 className={`ml-3 text-md font-semibold ${config.text}`}>{title}</h3>
            </div>
            <div className="mt-2 text-center w-full">
                <p className={`text-sm font-bold ${config.text}`}>{config.message}</p>
                {status === 'completed' && completedAt && (
                    <p className="text-xs text-slate-500">{completedAt}</p>
                )}
            </div>
        </button>
    );
};


const StatusOverview: React.FC<StatusOverviewProps> = ({ waterTests, weeklyEvaporationLogs, navigateToForm, simulatedDate }) => {
    const now = simulatedDate || new Date();
    const today_YYYY_MM_DD = now.toISOString().split('T')[0];

    // --- Status Logic ---
    const formatCompletionTime = (dateStr: string, timeStr: string): string => {
        const dt = new Date(`${dateStr}T${timeStr}`);
        const formattedDate = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const formattedTime = dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${formattedDate}, ${formattedTime}`;
    };

    // 1. Daily Water Test Status
    const todaysWaterTest = waterTests
        .filter(t => t.date === today_YYYY_MM_DD)
        .sort((a, b) => (b.time || '').localeCompare(a.time || ''))[0];

    // 2. Daily Blowdown Status
    const todaysBlowdown = waterTests
        .filter(t => t.date === today_YYYY_MM_DD && t.leftSightGlass === 'Completed' && t.rightSightGlass === 'Completed' && t.bottomBlowdown === 'Completed')
        .sort((a, b) => (b.time || '').localeCompare(a.time || ''))[0];

    // 3. Weekly Evaporation Status
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const startOfWeek = new Date(now);
    // Week starts Monday (1), ends Sunday (0). If today is Sunday, go back 6 days. Otherwise go back (day-1) days.
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(now.getDate() - offset);
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeeksEvapTest = weeklyEvaporationLogs.find(log => {
        const logDate = new Date(log.testDate + 'T00:00:00');
        return logDate >= startOfWeek;
    });

    let evapStatus: Status = 'pending';
    if (thisWeeksEvapTest) {
        evapStatus = 'completed';
    } else if ([0, 4, 5, 6].includes(dayOfWeek)) { // Warning on Thu, Fri, Sat, Sun
        evapStatus = 'warning';
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
             <h2 className="text-lg font-semibold text-slate-800 mb-4">Task Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard 
                    title="Daily Water Test"
                    status={todaysWaterTest ? 'completed' : 'pending'}
                    completedAt={todaysWaterTest ? formatCompletionTime(todaysWaterTest.date, todaysWaterTest.time) : undefined}
                    onClick={() => navigateToForm('waterTest')}
                />
                <StatusCard 
                    title="Daily Blowdown Test"
                    status={todaysBlowdown ? 'completed' : 'pending'}
                    completedAt={todaysBlowdown ? formatCompletionTime(todaysBlowdown.date, todaysBlowdown.time) : undefined}
                    onClick={() => navigateToForm('dailyBlowdown')}
                />
                <StatusCard 
                    title="Weekly Evaporation Test"
                    status={evapStatus}
                    completedAt={thisWeeksEvapTest ? formatCompletionTime(thisWeeksEvapTest.testDate, thisWeeksEvapTest.testTime) : undefined}
                    onClick={() => navigateToForm('weeklyEvaporation')}
                />
            </div>
        </div>
    );
};

export default StatusOverview;