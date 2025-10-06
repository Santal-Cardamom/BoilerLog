import * as React from 'react';
import { WaterTestEntry, TestParameters, ParameterRange, EntryView, CommentLog } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { XIcon } from './icons/XIcon';

interface StatusOverviewProps {
    latestTest: WaterTestEntry;
    settings: TestParameters;
    setNewEntryTarget: (target: EntryView) => void;
    commentLogs: CommentLog[];
}

type ValidatedField = keyof Omit<TestParameters, 'authorizedUsers' | 'hardness'>;

const parameterDisplayNames: Record<ValidatedField, string> = {
  sulphite: "Sulphite",
  alkalinity: "Alkalinity",
  boilerPh: "Boiler Ph",
  tdsProbeReadout: "TDS Probe Readout",
  tdsLevelCheck: "TDS Level Check",
  feedWaterHardness: "Feed Water Hardness",
  feedWaterPh: "Feed Water Ph",
  boilerSoftenerHardness: "Boiler Softener Hardness",
  condensateHardness: "Condensate Hardness",
  condensateTds: "Condensate TDS",
  condensatePh: "Condensate Ph",
};

const OutOfSpecModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    outOfSpecItems: ValidatedField[];
    latestTest: WaterTestEntry;
    settings: TestParameters;
}> = ({ isOpen, onClose, outOfSpecItems, latestTest, settings }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <header className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Out of Spec Parameters</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" aria-label="Close">
                        <XIcon />
                    </button>
                </header>
                <main className="p-6">
                    <p className="text-sm text-slate-600 mb-4">The following parameters from the latest test were outside of their acceptable ranges:</p>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Parameter</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Recorded Value</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acceptable Range</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {outOfSpecItems.map(key => {
                                const spec = settings[key] as ParameterRange;
                                const value = latestTest[key as keyof WaterTestEntry];
                                return (
                                    <tr key={key}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{parameterDisplayNames[key]}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-bold">{value ?? 'N/A'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{`${spec.min} - ${spec.max}`}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </main>
                <footer className="p-4 bg-slate-50 text-right rounded-b-lg">
                     <button onClick={onClose} className="px-4 py-2 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">Close</button>
                </footer>
            </div>
        </div>
    );
};

const StatusOverview: React.FC<StatusOverviewProps> = ({ latestTest, settings, setNewEntryTarget, commentLogs }) => {
    const [isSpecModalOpen, setSpecModalOpen] = React.useState(false);

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

    const last3Comments = [...commentLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 3);

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
        <>
            <div className={`p-6 rounded-lg shadow-md border-l-8 ${status === 'ok' ? 'border-green-500 bg-white' : 'border-red-500 bg-white'}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start">
                            {status === 'ok' ? (
                                <CheckCircleIcon className="h-10 w-10 text-green-500 mr-4 flex-shrink-0" />
                            ) : (
                                <ExclamationTriangleIcon className="h-10 w-10 text-red-500 mr-4 flex-shrink-0" />
                            )}
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {status === 'ok' ? 'All Systems Nominal' : `${outOfSpecCount} Parameter${outOfSpecCount > 1 ? 's' : ''} Out of Spec`}
                                </h3>
                                <div className="flex items-center text-sm text-slate-500 mt-1">
                                    <ClockIcon className="h-4 w-4 mr-1.5" />
                                    <span>Last test on {formatDate(latestTest.date, latestTest.time)}</span>
                                </div>
                                {last3Comments.length > 0 && (
                                    <div className="mt-2 text-xs text-slate-500 space-y-1">
                                        <p className="font-semibold text-slate-600">Recent Comments:</p>
                                        <ul className="list-disc list-inside">
                                            {last3Comments.map(comment => (
                                                <li key={comment.id} className="truncate" title={comment.text}>
                                                    {comment.text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        {status === 'ok' ? (
                            <>
                                <QuickActionButton onClick={() => setNewEntryTarget('waterTest')}>
                                    New Water Test
                                </QuickActionButton>
                                <QuickActionButton onClick={() => setNewEntryTarget('weeklyEvaporation')}>
                                    Weekly Evaporation
                                </QuickActionButton>
                            </>
                        ) : (
                             <button
                                onClick={() => setSpecModalOpen(true)}
                                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg border border-red-600 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"
                            >
                                View Out of Spec Details
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <OutOfSpecModal
                isOpen={isSpecModalOpen}
                onClose={() => setSpecModalOpen(false)}
                outOfSpecItems={outOfSpecItems}
                latestTest={latestTest}
                settings={settings}
            />
        </>
    );
};

export default StatusOverview;