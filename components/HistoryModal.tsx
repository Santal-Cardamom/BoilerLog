
import * as React from 'react';
import { WaterTestEntry, TestParameters, ParameterRange } from '../types';
import { XIcon } from './icons/XIcon';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    allTests: WaterTestEntry[];
    settings: TestParameters;
}

const ITEMS_PER_PAGE = 15;
type ValidatedFields = keyof Omit<TestParameters, 'authorizedUsers' | 'hardness'>;

const getValidationClasses = (
    key: ValidatedFields,
    value: number | undefined | null,
    settings: TestParameters
): string => {
    // FIX: This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.
    if (value === null || value === undefined) return "text-slate-500";
    
    const numValue = Number(value);
    if (isNaN(numValue)) return "text-slate-500";

    const spec = settings[key] as ParameterRange | undefined;
    if (!spec) return "text-slate-500";

    if (numValue >= spec.min && numValue <= spec.max) {
        return "text-green-600 font-bold";
    }
    return "text-red-600 font-bold";
};

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, allTests, settings }) => {
    // Note: Filters are not yet updated for all new fields. This can be a future enhancement.
    const [filters, setFilters] = React.useState({
        startDate: '',
        endDate: '',
        sulphiteMin: '',
        sulphiteMax: '',
        alkalinityMin: '',
        alkalinityMax: '',
    });
    const [filteredTests, setFilteredTests] = React.useState<WaterTestEntry[]>(allTests);
    const [currentPage, setCurrentPage] = React.useState(1);

    React.useEffect(() => {
        if (isOpen) {
            handleResetFilters();
        }
    }, [isOpen, allTests]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        let data = [...allTests];

        if (filters.startDate) {
            const startDate = new Date(filters.startDate + 'T00:00:00');
            data = data.filter(t => new Date(t.date + 'T00:00:00') >= startDate);
        }
        if (filters.endDate) {
            const endDate = new Date(filters.endDate + 'T00:00:00');
            data = data.filter(t => new Date(t.date + 'T00:00:00') <= endDate);
        }
        if (filters.sulphiteMin !== '') {
            data = data.filter(t => (t.sulphite ?? 0) >= Number(filters.sulphiteMin));
        }
        if (filters.sulphiteMax !== '') {
            data = data.filter(t => (t.sulphite ?? Infinity) <= Number(filters.sulphiteMax));
        }
        if (filters.alkalinityMin !== '') {
            data = data.filter(t => (t.alkalinity ?? 0) >= Number(filters.alkalinityMin));
        }
        if (filters.alkalinityMax !== '') {
            data = data.filter(t => (t.alkalinity ?? Infinity) <= Number(filters.alkalinityMax));
        }
        
        setFilteredTests(data);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            sulphiteMin: '',
            sulphiteMax: '',
            alkalinityMin: '',
            alkalinityMax: '',
        });
        setFilteredTests(allTests);
        setCurrentPage(1);
    };

    const paginatedTests = React.useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredTests]);

    const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);
    
    const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString();
    
    const getUserNameById = (userId?: string) => {
        if (!userId) return 'N/A';
        const user = settings.authorizedUsers.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    const headerClasses = "px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider";
    const cellClasses = "px-6 py-4 whitespace-nowrap text-sm";
    const NA = <span className="text-slate-400">N/A</span>;
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Full Water Test History</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" aria-label="Close">
                        <XIcon />
                    </button>
                </header>

                <div className="p-4 border-b border-slate-200">
                    {/* Filters remain simplified for now */}
                    <div className="flex gap-4 items-end">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-600">Start Date</label>
                            <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 input-base"/>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-600">End Date</label>
                            <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 input-base"/>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={handleApplyFilters} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Apply</button>
                             <button onClick={handleResetFilters} className="px-4 py-2 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">Reset</button>
                        </div>
                    </div>
                </div>

                <main className="flex-1 overflow-auto">
                     <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-200 sticky top-0 z-10">
                            <tr>
                                {/* Pinned columns for context */}
                                <th scope="col" className={`${headerClasses} sticky left-0 bg-slate-200`}>Date</th>
                                <th scope="col" className={`${headerClasses} sticky left-24 bg-slate-200`}>Time</th>
                                <th scope="col" className={headerClasses}>Tested By</th>
                                <th scope="col" className={headerClasses}>Boiler</th>

                                {/* Water Tests */}
                                <th scope="col" className={headerClasses}>Sulphite</th>
                                <th scope="col" className={headerClasses}>Alkalinity</th>
                                <th scope="col" className={headerClasses}>Boiler pH</th>
                                <th scope="col" className={headerClasses}>TDS Probe</th>
                                <th scope="col" className={headerClasses}>TDS Check</th>

                                {/* Feed Water */}
                                <th scope="col" className={headerClasses}>Feed Hardness</th>
                                <th scope="col" className={headerClasses}>Feed pH</th>

                                {/* Boiler Softeners */}
                                <th scope="col" className={headerClasses}>Boiler Soft. Hardness</th>
                                <th scope="col" className={headerClasses}>Boiler Soft. Unit</th>
                                <th scope="col" className={headerClasses}>Litres to Regen</th>
                                <th scope="col" className={headerClasses}>Salt Bags</th>
                                
                                {/* ... Add other headers as needed ... */}
                                <th scope="col" className={headerClasses}>Comment</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                             {paginatedTests.length > 0 ? paginatedTests.slice().reverse().map((test) => (
                                <tr key={test.id} className="hover:bg-slate-50">
                                    <td className={`${cellClasses} sticky left-0 bg-white font-medium text-slate-900`}>{formatDate(test.date)}</td>
                                    <td className={`${cellClasses} sticky left-24 bg-white text-slate-500`}>{test.time}</td>
                                    <td className={`${cellClasses} text-slate-500`}>{getUserNameById(test.testedByUserId)}</td>
                                    <td className={`${cellClasses} text-slate-500`}>{test.boilerName}</td>
                                    
                                    <td className={`${cellClasses} ${getValidationClasses('sulphite', test.sulphite, settings)}`}>{test.sulphite ?? NA}</td>
                                    <td className={`${cellClasses} ${getValidationClasses('alkalinity', test.alkalinity, settings)}`}>{test.alkalinity ?? NA}</td>
                                    <td className={`${cellClasses} ${getValidationClasses('boilerPh', test.boilerPh, settings)}`}>{test.boilerPh ?? NA}</td>
                                    <td className={`${cellClasses} ${getValidationClasses('tdsProbeReadout', test.tdsProbeReadout, settings)}`}>{test.tdsProbeReadout ?? NA}</td>
                                    <td className={`${cellClasses} ${getValidationClasses('tdsLevelCheck', test.tdsLevelCheck, settings)}`}>{test.tdsLevelCheck ?? NA}</td>

                                    <td className={`${cellClasses} ${getValidationClasses('feedWaterHardness', test.feedWaterHardness, settings)}`}>{test.feedWaterHardness ?? NA}</td>
                                    <td className={`${cellClasses} ${getValidationClasses('feedWaterPh', test.feedWaterPh, settings)}`}>{test.feedWaterPh ?? NA}</td>

                                    <td className={`${cellClasses} ${getValidationClasses('boilerSoftenerHardness', test.boilerSoftenerHardness, settings)}`}>{test.boilerSoftenerHardness ?? NA}</td>
                                    <td className={`${cellClasses} text-slate-500`}>{test.boilerSoftenerUnitInService ?? NA}</td>
                                    <td className={`${cellClasses} text-slate-500`}>{test.boilerSoftenerLitresUntilRegen ?? NA}</td>
                                    <td className={`${cellClasses} text-slate-500`}>{test.boilerSoftenerSaltBagsAdded ?? NA}</td>
                                    
                                    <td className={`${cellClasses} max-w-xs truncate text-slate-500`}>{test.commentText ?? NA}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={17} className="text-center py-10 text-slate-500">No records match the current filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </main>

                <footer className="flex items-center justify-between p-4 border-t border-slate-200">
                     <span className="text-sm text-slate-600">
                        Showing <span className="font-semibold">{Math.min(1 + (currentPage - 1) * ITEMS_PER_PAGE, filteredTests.length)}</span> to <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTests.length)}</span> of <span className="font-semibold">{filteredTests.length}</span> results
                     </span>
                     <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            Previous
                        </button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next
                        </button>
                     </div>
                </footer>
            </div>
             <style>{`
                .input-base {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    background-color: white;
                    border: 1px solid #cbd5e1;
                    border-radius: 0.375rem;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    color: black;
                }
                .input-base:focus {
                    outline: none;
                    --tw-ring-color: #0ea5e9;
                    box-shadow: 0 0 0 1px var(--tw-ring-color);
                    border-color: var(--tw-ring-color);
                }
            `}</style>
        </div>
    );
};

export default HistoryModal;