import * as React from 'react';
import { TestParameters, ParameterRange } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

type ValidatedFields = keyof Omit<TestParameters, 'authorizedUsers' | 'hardness'>;
interface OutOfSpecItem {
    key: ValidatedFields;
    name: string;
    value: any;
    spec: ParameterRange;
}

interface LatestTestStatusProps {
    outOfSpecItems: OutOfSpecItem[];
}

const LatestTestStatus: React.FC<LatestTestStatusProps> = ({ outOfSpecItems }) => {
    if (outOfSpecItems.length === 0) {
        return (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md h-full flex flex-col justify-center items-center text-center">
                <CheckCircleIcon className="h-10 w-10 text-green-500" />
                <p className="font-bold text-lg mt-2">All Systems Normal</p>
                <p className="text-sm">Latest boiler water tests are within specified ranges.</p>
            </div>
        );
    }

    return (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-lg shadow-md h-full">
            <div className="flex items-center mb-2">
                <ExclamationTriangleIcon className="h-8 w-8 mr-3 text-amber-500" />
                <div>
                    <p className="font-bold text-lg">Attention Required</p>
                    <p className="text-sm">{outOfSpecItems.length} parameter(s) are out of spec.</p>
                </div>
            </div>
            <ul className="list-disc list-inside text-sm text-amber-800 space-y-1 pl-2">
                {outOfSpecItems.map(item => (
                    <li key={item.key}>
                        <span className="font-semibold">{item.name}:</span> {String(item.value)} (Spec: {(item.spec as ParameterRange).min} - {(item.spec as ParameterRange).max})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LatestTestStatus;