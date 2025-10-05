
import React, { useState } from 'react';
import { TestParameters } from '../types';

interface SettingsProps {
    currentSettings: TestParameters;
    onSettingsSave: (newSettings: TestParameters) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentSettings, onSettingsSave }) => {
    const [settings, setSettings] = useState<TestParameters>(currentSettings);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const [category, field] = name.split('.');
        
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof TestParameters],
                [field]: Number(value)
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSettingsSave(settings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900";

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-8" aria-labelledby="settings-title">
                <h2 id="settings-title" className="text-2xl font-bold text-slate-900">Test Parameters</h2>
                
                <fieldset className="space-y-4 p-4 border border-slate-200 rounded-lg">
                    <legend className="text-lg font-semibold text-slate-800 px-2">Sulphite (ppm)</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="sulphite.min" className="block text-sm font-medium text-slate-700">Minimum Value</label>
                            <input type="number" name="sulphite.min" id="sulphite.min" value={settings.sulphite.min} onChange={handleChange} required className={inputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="sulphite.max" className="block text-sm font-medium text-slate-700">Maximum Value</label>
                            <input type="number" name="sulphite.max" id="sulphite.max" value={settings.sulphite.max} onChange={handleChange} required className={inputClasses}/>
                        </div>
                    </div>
                </fieldset>

                <fieldset className="space-y-4 p-4 border border-slate-200 rounded-lg">
                    <legend className="text-lg font-semibold text-slate-800 px-2">Alkalinity (ppm)</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="alkalinity.min" className="block text-sm font-medium text-slate-700">Minimum Value</label>
                            <input type="number" name="alkalinity.min" id="alkalinity.min" value={settings.alkalinity.min} onChange={handleChange} required className={inputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="alkalinity.max" className="block text-sm font-medium text-slate-700">Maximum Value</label>
                            <input type="number" name="alkalinity.max" id="alkalinity.max" value={settings.alkalinity.max} onChange={handleChange} required className={inputClasses}/>
                        </div>
                    </div>
                </fieldset>
                
                <fieldset className="space-y-4 p-4 border border-slate-200 rounded-lg">
                    <legend className="text-lg font-semibold text-slate-800 px-2">Hardness</legend>
                    <div>
                        <label htmlFor="hardness.max" className="block text-sm font-medium text-slate-700">Maximum Acceptable Value</label>
                         <select name="hardness.max" id="hardness.max" value={settings.hardness.max} onChange={handleChange} required className={inputClasses}>
                            <option value="0">0 ppm (Soft)</option>
                            <option value="1">1 ppm</option>
                            <option value="2">2+ ppm (Hard)</option>
                        </select>
                        <p className="mt-2 text-xs text-slate-600" id="hardness-description">Any value greater than this will be marked as out of spec.</p>
                    </div>
                </fieldset>

                <div className="flex justify-end items-center">
                    {showSuccess && <span className="text-green-600 mr-4 transition-opacity duration-300" role="status">Settings saved successfully!</span>}
                    <button type="submit" className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Save Settings</button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
