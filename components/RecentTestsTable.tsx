import React from 'react';
import { WaterTestEntry, TestParameters } from '../types';

interface RecentTestsTableProps {
    tests: WaterTestEntry[];
    settings: TestParameters;
}

const RecentTestsTable: React.FC<RecentTestsTableProps> = ({ tests, settings }) => {

    const isOutOfSpec = (key: 'sulphite' | 'alkalinity' | 'hardness', value: number): boolean => {
        if (!settings) return false;
        
        // Ensure all values are treated as numbers for comparison to avoid type issues.
        const numValue = Number(value);

        switch(key) {
            case 'sulphite': 
                return numValue < Number(settings.sulphite.min) || numValue > Number(settings.sulphite.max);
            case 'alkalinity': 
                return numValue < Number(settings.alkalinity.min) || numValue > Number(settings.alkalinity.max);
            case 'hardness': 
                return numValue > Number(settings.hardness.max);
            default: return false;
        }
    };

    const valueCellClasses = (key: 'sulphite' | 'alkalinity', value: number) => {
        let base = "px-6 py-4 whitespace-nowrap text-sm ";
        if (isOutOfSpec(key, value)) {
            return base + "text-red-600 font-bold";
        }
        return base + "text-slate-500";
    };

    const getHardnessBadge = (hardness: number) => {
        const isHardnessOutOfSpec = isOutOfSpec('hardness', hardness);
        let badgeClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full ";
        let text = "Hard";

        if (hardness === 0) {
            badgeClasses += "bg-green-100 text-green-800";
            text = "Soft";
        } else if (hardness === 1) {
            badgeClasses += "bg-yellow-100 text-yellow-800";
            text = "Medium";
        } else {
            badgeClasses += "bg-red-100 text-red-800";
        }

        if (isHardnessOutOfSpec) {
            badgeClasses += " ring-2 ring-red-500 ring-offset-1";
        }
        
        return <span className={badgeClasses}>{text}</span>;
    };
    
    // Correct date parsing to avoid timezone issues
    const formatDate = (dateString: string) => {
        // Appending 'T00:00:00' ensures the date is parsed in the local timezone, not UTC,
        // preventing the date from being off by one day in some timezones.
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString();
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sulphite (ppm)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Alkalinity (ppm)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hardness</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {tests.slice().reverse().map((test) => (
                        <tr key={test.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatDate(test.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{test.time}</td>
                            <td className={valueCellClasses('sulphite', test.sulphite)}>{test.sulphite}</td>
                            <td className={valueCellClasses('alkalinity', test.alkalinity)}>{test.alkalinity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getHardnessBadge(test.hardness)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentTestsTable;