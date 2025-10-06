import React from 'react';
import { WaterTestEntry, TestParameters, ParameterRange } from '../types';

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

interface RecentTestsTableProps {
    tests: WaterTestEntry[];
    settings: TestParameters;
}

const RecentTestsTable: React.FC<RecentTestsTableProps> = ({ tests, settings }) => {
    // Correct date parsing to avoid timezone issues
    const formatDate = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString();
    };
    
    const getUserNameById = (userId?: string) => {
        if (!userId) return 'N/A';
        const user = settings.authorizedUsers.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    const headerClasses = "px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider";
    const NA = <span className="text-slate-400">N/A</span>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className={headerClasses}>Date</th>
                        <th scope="col" className={headerClasses}>Time</th>
                        <th scope="col" className={headerClasses}>Boiler</th>
                        <th scope="col" className={headerClasses}>Tested By</th>
                        <th scope="col" className={headerClasses}>Sulphite (ppm)</th>
                        <th scope="col" className={headerClasses}>Alkalinity (ppm)</th>
                        <th scope="col" className={headerClasses}>Boiler pH</th>
                        <th scope="col" className={headerClasses}>Feed Water Hardness (ppm)</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {tests.slice().reverse().map((test) => (
                        <tr key={test.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatDate(test.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{test.time}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{test.boilerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getUserNameById(test.testedByUserId)}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${getValidationClasses('sulphite', test.sulphite, settings)}`}>{test.sulphite ?? NA}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${getValidationClasses('alkalinity', test.alkalinity, settings)}`}>{test.alkalinity ?? NA}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${getValidationClasses('boilerPh', test.boilerPh, settings)}`}>{test.boilerPh ?? NA}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${getValidationClasses('feedWaterHardness', test.feedWaterHardness, settings)}`}>{test.feedWaterHardness ?? NA}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentTestsTable;