
import * as React from 'react';
import { WaterTestEntry, TestParameters, ParameterRange, EntryView } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ClockIcon } from './icons/ClockIcon';

interface StatusOverviewProps {
    latestTest: WaterTestEntry;
    settings: TestParameters;
    setNewEntryTarget: (target: EntryView) => void;
}

type ValidatedField = keyof Omit<TestParameters, 'authorizedUsers' | 'hardness'>;

const StatusOverview: React.FC<StatusOverviewProps> = ({ latestTest, settings, setNewEntryTarget }) => {
    const validatedFields: ValidatedField[] = [
        'sulphite', 'alkalinity', 'boilerPh', 'tdsProbeReadout', 'tdsLevelCheck',
        'feedWaterHardness', 'feedWaterPh', 'boilerSoftenerHardness',
        'condensateHardness', 'condensateTds', 'condensatePh'
    ];

    const outOfSpecItems = validatedFields.filter(key => {
        const value = latestTest[key as keyof WaterTestEntry] as number | undefined;
        const spec = settings[key] as ParameterRange | undefined;
        if (value === undefined || value === null || !spec) {
            return false;
        }
        return value < spec.min || value > spec.max;
    });
    
    const outOfSpecCount = outOfSpecItems.length;
    const status = outOfSpecCount > 0 ? 'warning' : 'ok';
    
    const formatDate = (dateString: string, timeString: string) => {
        const date = new Date(`${dateString}T${timeString}`);
        return date.toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'short'
        });
    };

    const QuickActionButton: React.FC<{
        onClick: () => void;
        children: React.ReactNode;
    }> = ({ onClick, children }) => (
        <button
            onClick={onClick}
            className="px-4 py-2 bg-white text-sky-600 font-semibold rounded-lg border border-sky-600 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 text-sm"
        >
            {children}
        </button>
    );

    return (
        <div className={`p-6 rounded-lg shadow-md border-l-8 ${status === 'ok' ? 'border-green-500 bg-white' : 'border-red-500 bg-white'}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center">
                    {status === 'ok' ? (
                        <CheckCircleIcon className="h-10 w-10 text-green-500 mr-4" />
                    ) : (
                        <ExclamationTriangleIcon className="h-10 w-10 text-red-500 mr-4" />
                    )}
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">
                            {status === 'ok' ? 'All Systems Nominal' : `${outOfSpecCount} Parameter${outOfSpecCount > 1 ? 's' : ''} Out of Spec`}
                        </h3>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                            <ClockIcon className="h-4 w-4 mr-1.5" />
                            <span>Last test on {formatDate(latestTest.date, latestTest.time)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <QuickActionButton onClick={() => setNewEntryTarget('waterTest')}>
                        New Water Test
                    </QuickActionButton>
                    <QuickActionButton onClick={() => setNewEntryTarget('weeklyEvaporation')}>
                        Weekly Evaporation
                    </QuickActionButton>
                </div>
            </div>
        </div>
    );
};

export default StatusOverview;
