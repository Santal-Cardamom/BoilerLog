import React, { useState } from 'react';
import { TestParameters, AuthorizedUser } from '../types';

interface SettingsProps {
    currentSettings: TestParameters;
    onSettingsSave: (newSettings: TestParameters) => void;
}

type ActiveTab = 'standard' | 'users';

const ParameterInputGroup: React.FC<{
    legend: string;
    fields: { key: keyof TestParameters, label: string }[];
    settings: TestParameters;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ legend, fields, settings, handleChange }) => (
    <fieldset className="space-y-4 p-4 border border-slate-200 rounded-lg">
        <legend className="text-lg font-semibold text-slate-800 px-2">{legend}</legend>
        {fields.map(fieldInfo => (
            <div key={String(fieldInfo.key)}>
                <label className="block text-base font-medium text-slate-700 mb-2">{fieldInfo.label}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor={`${String(fieldInfo.key)}.min`} className="block text-sm font-medium text-slate-600">Min Value</label>
                        <input
                            type="number"
                            name={`${String(fieldInfo.key)}.min`}
                            id={`${String(fieldInfo.key)}.min`}
                            value={(settings[fieldInfo.key] as any)?.min ?? ''}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900"
                        />
                    </div>
                    <div>
                        <label htmlFor={`${String(fieldInfo.key)}.max`} className="block text-sm font-medium text-slate-600">Max Value</label>
                        <input
                            type="number"
                            name={`${String(fieldInfo.key)}.max`}
                            id={`${String(fieldInfo.key)}.max`}
                            value={(settings[fieldInfo.key] as any)?.max ?? ''}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900"
                        />
                    </div>
                </div>
            </div>
        ))}
    </fieldset>
);


const Settings: React.FC<SettingsProps> = ({ currentSettings, onSettingsSave }) => {
    const [settings, setSettings] = useState<TestParameters>(currentSettings);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('standard');
    
    const [newUserName, setNewUserName] = useState('');

    const handleStandardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [category, field] = name.split('.');
        
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...(prev[category as keyof TestParameters] as object),
                [field]: Number(value)
            }
        }));
    };

    const addAuthorizedUser = () => {
        if (!newUserName.trim()) {
            alert('User name cannot be empty.');
            return;
        }
        const newUser: AuthorizedUser = {
            id: `user_${new Date().getTime()}`,
            name: newUserName.trim(),
        };
        setSettings(prev => ({ ...prev, authorizedUsers: [...prev.authorizedUsers, newUser] }));
        setNewUserName('');
    };

    const removeAuthorizedUser = (id: string) => {
        setSettings(prev => ({ ...prev, authorizedUsers: prev.authorizedUsers.filter(u => u.id !== id) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSettingsSave(settings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const tabClasses = (tabName: ActiveTab) => 
        `px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
            activeTab === tabName ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
        }`;

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900";

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex border-b border-slate-300">
                <button className={tabClasses('standard')} onClick={() => setActiveTab('standard')}>Standard Parameters</button>
                <button className={tabClasses('users')} onClick={() => setActiveTab('users')}>Authorized Users</button>
            </div>
            
            <div className="bg-white p-8 rounded-b-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {activeTab === 'standard' && (
                        <div className="space-y-8" aria-labelledby="standard-settings-title">
                             <h2 id="standard-settings-title" className="text-2xl font-bold text-slate-900">Standard Test Parameters</h2>
                            
                            <ParameterInputGroup
                                legend="Water Tests"
                                fields={[
                                    { key: 'sulphite', label: 'Sulphite (PPM)' },
                                    { key: 'alkalinity', label: 'Alkalinity (PPM)' },
                                    { key: 'boilerPh', label: 'Boiler pH (pH)' },
                                    { key: 'tdsProbeReadout', label: 'TDS Probe Readout (PPM)' },
                                    { key: 'tdsLevelCheck', label: 'TDS Level Check (PPM)' },
                                ]}
                                settings={settings}
                                handleChange={handleStandardChange}
                            />

                            <ParameterInputGroup
                                legend="Feed Water"
                                fields={[
                                    { key: 'feedWaterHardness', label: 'Hardness (PPM)' },
                                    { key: 'feedWaterPh', label: 'pH (pH)' },
                                ]}
                                settings={settings}
                                handleChange={handleStandardChange}
                            />

                            <ParameterInputGroup
                                legend="Boiler Softeners"
                                fields={[
                                     { key: 'boilerSoftenerHardness', label: 'Hardness (PPM)' },
                                ]}
                                settings={settings}
                                handleChange={handleStandardChange}
                            />
                            
                             <ParameterInputGroup
                                legend="Brewhouse Condensate"
                                fields={[
                                     { key: 'condensateHardness', label: 'Hardness (PPM)' },
                                     { key: 'condensateTds', label: 'TDS (PPM)' },
                                     { key: 'condensatePh', label: 'pH (pH)' },
                                ]}
                                settings={settings}
                                handleChange={handleStandardChange}
                            />
                        </div>
                    )}
                   
                    {activeTab === 'users' && (
                         <div className="space-y-8" aria-labelledby="user-settings-title">
                             <h2 id="user-settings-title" className="text-2xl font-bold text-slate-900">Manage Authorized Users</h2>
                             <div className="p-4 border border-slate-200 rounded-lg space-y-4">
                                 <h3 className="text-lg font-semibold text-slate-800">Add New User</h3>
                                 <div className="flex items-end gap-4">
                                     <div className="flex-grow">
                                         <label htmlFor="newUserName" className="block text-sm font-medium text-slate-700">User Name</label>
                                         <input type="text" id="newUserName" name="newUserName" placeholder="e.g., John Doe" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className={inputClasses}/>
                                     </div>
                                     <button type="button" onClick={addAuthorizedUser} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Add User</button>
                                 </div>
                             </div>
                             <div className="p-4 border border-slate-200 rounded-lg space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800">Existing Users</h3>
                                {settings.authorizedUsers.length > 0 ? (
                                    <ul className="space-y-3">
                                        {settings.authorizedUsers.map(user => (
                                            <li key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                                <span className="font-semibold text-slate-800">{user.name}</span>
                                                <button type="button" onClick={() => removeAuthorizedUser(user.id)} className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400">Remove</button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No authorized users have been added yet.</p>
                                )}
                            </div>
                         </div>
                    )}
                    <div className="flex justify-end items-center mt-8 pt-4 border-t border-slate-200">
                        {showSuccess && <span className="text-green-600 mr-4 transition-opacity duration-300" role="status">Settings saved successfully!</span>}
                        <button type="submit" className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Save All Settings</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;