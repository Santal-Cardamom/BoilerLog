
import React, { useState, useEffect } from 'react';
import { WaterTestEntry, BlowdownEntry, TestParameters } from '../types';

interface NewEntryProps {
    onAddWaterTest: (entry: Omit<WaterTestEntry, 'id'>) => void;
    onAddBlowdownLog: (entry: Omit<BlowdownEntry, 'id'>) => void;
    settings: TestParameters;
}

type ActiveTab = 'waterTest' | 'blowdown';

const NewEntry: React.FC<NewEntryProps> = ({ onAddWaterTest, onAddBlowdownLog, settings }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('waterTest');

    const [waterTestForm, setWaterTestForm] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        sulphite: '',
        alkalinity: '',
        hardness: '0',
    });

    const [blowdownForm, setBlowdownForm] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        duration: '',
        reason: '',
    });
    
    const [errors, setErrors] = useState({
        sulphite: false,
        alkalinity: false,
        hardness: false,
    });

    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const validateField = (name: keyof typeof errors, value: string) => {
            if (value === '') return false;
            const numValue = Number(value);
            if (isNaN(numValue)) return false;

            switch(name) {
                case 'sulphite':
                    return numValue < settings.sulphite.min || numValue > settings.sulphite.max;
                case 'alkalinity':
                    return numValue < settings.alkalinity.min || numValue > settings.alkalinity.max;
                case 'hardness':
                    return numValue > settings.hardness.max;
                default:
                    return false;
            }
        };

        setErrors({
            sulphite: validateField('sulphite', waterTestForm.sulphite),
            alkalinity: validateField('alkalinity', waterTestForm.alkalinity),
            hardness: validateField('hardness', waterTestForm.hardness),
        });
    }, [waterTestForm, settings]);

    const handleWaterTestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setWaterTestForm({ ...waterTestForm, [e.target.name]: e.target.value });
    };
    
    const handleBlowdownChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setBlowdownForm({ ...blowdownForm, [e.target.name]: e.target.value });
    };

    const handleWaterTestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddWaterTest({
            ...waterTestForm,
            sulphite: Number(waterTestForm.sulphite),
            alkalinity: Number(waterTestForm.alkalinity),
            hardness: Number(waterTestForm.hardness),
        });
        setWaterTestForm({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0].substring(0, 5),
            sulphite: '',
            alkalinity: '',
            hardness: '0',
        });
        triggerSuccessMessage();
    };
    
    const handleBlowdownSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddBlowdownLog({
            ...blowdownForm,
            duration: Number(blowdownForm.duration),
        });
        setBlowdownForm({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0].substring(0, 5),
            duration: '',
            reason: '',
        });
        triggerSuccessMessage();
    };

    const triggerSuccessMessage = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    }

    const tabClasses = (tabName: ActiveTab) => 
        `px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
            activeTab === tabName ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
        }`;

    const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500";
    const errorInputClasses = "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500";

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex border-b border-slate-300">
                <button className={tabClasses('waterTest')} onClick={() => setActiveTab('waterTest')}>Water Test Log</button>
                <button className={tabClasses('blowdown')} onClick={() => setActiveTab('blowdown')}>Boiler Blowdown Log</button>
            </div>
            
            <div className="bg-white p-8 rounded-b-lg shadow-md">
                {activeTab === 'waterTest' ? (
                    <form onSubmit={handleWaterTestSubmit} className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-700">New Water Test Entry</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-slate-600">Date</label>
                                <input type="date" name="date" id="date" value={waterTestForm.date} onChange={handleWaterTestChange} required className={baseInputClasses}/>
                            </div>
                            <div>
                                <label htmlFor="time" className="block text-sm font-medium text-slate-600">Time</label>
                                <input type="time" name="time" id="time" value={waterTestForm.time} onChange={handleWaterTestChange} required className={baseInputClasses}/>
                            </div>
                            <div>
                                <label htmlFor="sulphite" className="block text-sm font-medium text-slate-600">Sulphite (ppm)</label>
                                <input type="number" name="sulphite" id="sulphite" value={waterTestForm.sulphite} onChange={handleWaterTestChange} required className={`${baseInputClasses} ${errors.sulphite ? errorInputClasses : ''}`}/>
                            </div>
                            <div>
                                <label htmlFor="alkalinity" className="block text-sm font-medium text-slate-600">Alkalinity (ppm)</label>
                                <input type="number" name="alkalinity" id="alkalinity" value={waterTestForm.alkalinity} onChange={handleWaterTestChange} required className={`${baseInputClasses} ${errors.alkalinity ? errorInputClasses : ''}`}/>
                            </div>
                             <div>
                                <label htmlFor="hardness" className="block text-sm font-medium text-slate-600">Hardness</label>
                                <select name="hardness" id="hardness" value={waterTestForm.hardness} onChange={handleWaterTestChange} required className={`${baseInputClasses} ${errors.hardness ? errorInputClasses : ''}`}>
                                    <option value="0">0 ppm (Soft)</option>
                                    <option value="1">1 ppm</option>
                                    <option value="2">2+ ppm (Hard)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            {showSuccess && <span className="text-green-600 mr-4 transition-opacity duration-300">Entry saved successfully!</span>}
                            <button type="submit" className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Save Entry</button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleBlowdownSubmit} className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-700">New Blowdown Log Entry</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="blowdown-date" className="block text-sm font-medium text-slate-600">Date</label>
                                <input type="date" name="date" id="blowdown-date" value={blowdownForm.date} onChange={handleBlowdownChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                            </div>
                            <div>
                                <label htmlFor="blowdown-time" className="block text-sm font-medium text-slate-600">Time</label>
                                <input type="time" name="time" id="blowdown-time" value={blowdownForm.time} onChange={handleBlowdownChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                            </div>
                             <div className="md:col-span-2">
                                <label htmlFor="duration" className="block text-sm font-medium text-slate-600">Duration (minutes)</label>
                                <input type="number" name="duration" id="duration" value={blowdownForm.duration} onChange={handleBlowdownChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="reason" className="block text-sm font-medium text-slate-600">Reason / Comments</label>
                                <textarea name="reason" id="reason" rows={4} value={blowdownForm.reason} onChange={handleBlowdownChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                             {showSuccess && <span className="text-green-600 mr-4 transition-opacity duration-300">Entry saved successfully!</span>}
                            <button type="submit" className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Save Log</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default NewEntry;
