import React, { useState, useMemo, useEffect } from 'react';
import { WaterTestEntry, TestParameters } from '../types';
import { XIcon } from './icons/XIcon';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    allTests: WaterTestEntry[];
    settings: TestParameters;
}

const ITEMS_PER_PAGE = 15;

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, allTests, settings }) => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        sulphiteMin: '',
        sulphiteMax: '',
        alkalinityMin: '',
        alkalinityMax: '',
        hardness: 'all',
    });
    const [filteredTests, setFilteredTests] = useState<WaterTestEntry[]>(allTests);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (isOpen) {
            // Reset filters and pagination when modal opens
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
            data = data.filter(t => t.sulphite >= Number(filters.sulphiteMin));
        }
        if (filters.sulphiteMax !== '') {
            data = data.filter(t => t.sulphite <= Number(filters.sulphiteMax));
        }
        if (filters.alkalinityMin !== '') {
            data = data.filter(t => t.alkalinity >= Number(filters.alkalinityMin));
        }
        if (filters.alkalinityMax !== '') {
            data = data.filter(t => t.alkalinity <= Number(filters.alkalinityMax));
        }
        if (filters.hardness !== 'all') {
            data = data.filter(t => t.hardness === Number(filters.hardness));
        }
        
        setFilteredTests(data);
        setCurrentPage(1); // Reset to first page after filtering
    };

    const handleResetFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            sulphiteMin: '',
            sulphiteMax: '',
            alkalinityMin: '',
            alkalinityMax: '',
            hardness: 'all',
        });
        setFilteredTests(allTests);
        setCurrentPage(1);
    };

    const paginatedTests = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredTests]);

    const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);

    const isOutOfSpec = (key: string, value: number): boolean => {
         if (value === null || value === undefined) return false;
         const numValue = Number(value);
         if (isNaN(numValue)) return false;

         switch(key) {
            case 'sulphite': return numValue < Number(settings.sulphite.min) || numValue > Number(settings.sulphite.max);
            case 'alkalinity': return numValue < Number(settings.alkalinity.min) || numValue > Number(settings.alkalinity.max);
            case 'hardness': return numValue > Number(settings.hardness.max);
            default:
                const customParam = settings.custom.find(p => p.id === key);
                if (customParam) {
                    return numValue < Number(customParam.min) || numValue > Number(customParam.max);
                }
                return false;
        }
    };

    const valueCellClasses = (key: string, value: number) => {
        return isOutOfSpec(key, value) ? "text-red-600 font-bold" : "text-slate-500";
    };

    const getHardnessBadge = (hardness: number) => {
        const isHardnessOutOfSpec = isOutOfSpec('hardness', hardness);
        let badgeClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full ";
        let text = "Hard";
        if (hardness === 0) { badgeClasses += "bg-green-100 text-green-800"; text = "Soft"; } 
        else if (hardness === 1) { badgeClasses += "bg-yellow-100 text-yellow-800"; text = "Medium"; } 
        else { badgeClasses += "bg-red-100 text-red-800"; }
        if (isHardnessOutOfSpec) { badgeClasses += " ring-2 ring-red-500 ring-offset-1"; }
        return <span className={badgeClasses}>{text}</span>;
    };
    
    const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString();
    
    const getUserNameById = (userId?: string) => {
        if (!userId) return 'N/A';
        const user = settings.authorizedUsers.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    const headerClasses = "px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider";

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Full Water Test History</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" aria-label="Close">
                        <XIcon />
                    </button>
                </header>

                <div className="p-4 border-b border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
                        {/* Date Filters */}
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-600">Start Date</label>
                            <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 input-base"/>
                        </div>
                         <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-600">End Date</label>
                            <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 input-base"/>
                        </div>
                        {/* Sulphite Filters */}
                        <div className="flex gap-2">
                             <div>
                                <label htmlFor="sulphiteMin" className="block text-sm font-medium text-slate-600">Sulphite Min</label>
                                <input type="number" name="sulphiteMin" id="sulphiteMin" placeholder="e.g., 30" value={filters.sulphiteMin} onChange={handleFilterChange} className="mt-1 input-base"/>
                            </div>
                             <div>
                                <label htmlFor="sulphiteMax" className="block text-sm font-medium text-slate-600">Sulphite Max</label>
                                <input type="number" name="sulphiteMax" id="sulphiteMax" placeholder="e.g., 50" value={filters.sulphiteMax} onChange={handleFilterChange} className="mt-1 input-base"/>
                            </div>
                        </div>
                        {/* Alkalinity Filters */}
                         <div className="flex gap-2">
                             <div>
                                <label htmlFor="alkalinityMin" className="block text-sm font-medium text-slate-600">Alkalinity Min</label>
                                <input type="number" name="alkalinityMin" id="alkalinityMin" placeholder="e.g., 350" value={filters.alkalinityMin} onChange={handleFilterChange} className="mt-1 input-base"/>
                            </div>
                             <div>
                                <label htmlFor="alkalinityMax" className="block text-sm font-medium text-slate-600">Alkalinity Max</label>
                                <input type="number" name="alkalinityMax" id="alkalinityMax" placeholder="e.g., 450" value={filters.alkalinityMax} onChange={handleFilterChange} className="mt-1 input-base"/>
                            </div>
                        </div>
                        {/* Hardness Filter */}
                         <div>
                            <label htmlFor="hardness" className="block text-sm font-medium text-slate-600">Hardness</label>
                            <select name="hardness" id="hardness" value={filters.hardness} onChange={handleFilterChange} className="mt-1 input-base">
                                <option value="all">All</option>
                                <option value="0">0 ppm (Soft)</option>
                                <option value="1">1 ppm</option>
                                <option value="2">2+ ppm (Hard)</option>
                            </select>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                             <button onClick={handleApplyFilters} className="w-full px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Apply</button>
                             <button onClick={handleResetFilters} className="w-full px-4 py-2 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">Reset</button>
                        </div>
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto">
                     <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-200 sticky top-0">
                            <tr>
                                <th className={headerClasses}>Date</th>
                                <th className={headerClasses}>Time</th>
                                <th className={headerClasses}>Sulphite (ppm)</th>
                                <th className={headerClasses}>Alkalinity (ppm)</th>
                                <th className={headerClasses}>Hardness</th>
                                <th className={headerClasses}>Tested By</th>
                                {settings.custom.map(param => (
                                    <th key={param.id} className={headerClasses}>
                                        {param.name} ({param.unit})
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                             {paginatedTests.length > 0 ? paginatedTests.slice().reverse().map((test) => (
                                <tr key={test.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatDate(test.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{test.time}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${valueCellClasses('sulphite', test.sulphite)}`}>{test.sulphite}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${valueCellClasses('alkalinity', test.alkalinity)}`}>{test.alkalinity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getHardnessBadge(test.hardness)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getUserNameById(test.testedByUserId)}</td>
                                    {settings.custom.map(param => (
                                        <td key={param.id} className={`px-6 py-4 whitespace-nowrap text-sm ${valueCellClasses(param.id, test.customFields?.[param.id])}`}>
                                            {test.customFields?.[param.id] ?? 'N/A'}
                                        </td>
                                    ))}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6 + settings.custom.length} className="text-center py-10 text-slate-500">No records match the current filters.</td>
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
