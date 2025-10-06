import React, { useState } from 'react';
import { TestParameters, CustomParameter, AuthorizedUser } from '../types';

interface SettingsProps {
    currentSettings: TestParameters;
    onSettingsSave: (newSettings: TestParameters) => void;
}

type ActiveTab = 'standard' | 'custom' | 'users';

const Settings: React.FC<SettingsProps> = ({ currentSettings, onSettingsSave }) => {
    const [settings, setSettings] = useState<TestParameters>(currentSettings);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('standard');
    
    const [newCustomParam, setNewCustomParam] = useState({
        name: '',
        unit: '',
        min: '',
        max: '',
    });

    const [newUserName, setNewUserName] = useState('');

    const handleStandardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    
    const handleNewCustomParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCustomParam({ ...newCustomParam, [e.target.name]: e.target.value });
    };

    const addCustomParameter = () => {
        if (!newCustomParam.name || !newCustomParam.unit || newCustomParam.min === '' || newCustomParam.max === '') {
            alert('Please fill out all fields for the new parameter.');
            return;
        }
        const newParam: CustomParameter = {
            id: `custom_${new Date().getTime()}`,
            name: newCustomParam.name,
            unit: newCustomParam.unit,
            min: Number(newCustomParam.min),
            max: Number(newCustomParam.max),
        };
        setSettings(prev => ({ ...prev, custom: [...prev.custom, newParam] }));
        setNewCustomParam({ name: '', unit: '', min: '', max: '' });
    };

    const removeCustomParameter = (id: string) => {
        setSettings(prev => ({ ...prev, custom: prev.custom.filter(p => p.id !== id) }));
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
                <button className={tabClasses('custom')} onClick={() => setActiveTab('custom')}>Custom Parameters</button>
                <button className={tabClasses('users')} onClick={() => setActiveTab('users')}>Authorized Users</button>
            </div>
            
            <div className="bg-white p-8 rounded-b-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {activeTab === 'standard' && (
                        <div className="space-y-8" aria-labelledby="standard-settings-title">
                             <h2 id="standard-settings-title" className="text-2xl font-bold text-slate-900">Standard Test Parameters</h2>
                            <fieldset className="space-y-4 p-4 border border-slate-200 rounded-lg">
                                <legend className="text-lg font-semibold text-slate-800 px-2">Sulphite (ppm)</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="sulphite.min" className="block text-sm font-medium text-slate-700">Minimum Value</label>
                                        <input type="number" name="sulphite.min" id="sulphite.min" value={settings.sulphite.min} onChange={handleStandardChange} required className={inputClasses}/>
                                    </div>
                                    <div>
                                        <label htmlFor="sulphite.max" className="block text-sm font-medium text-slate-700">Maximum Value</label>
                                        <input type="number" name="sulphite.max" id="sulphite.max" value={settings.sulphite.max} onChange={handleStandardChange} required className={inputClasses}/>
                                    </div>
                                </div>
                            </fieldset>
                             <fieldset className="space-y-4 p-4 border border-slate-200 rounded-lg">
                                <legend className="text-lg font-semibold text-slate-800 px-2">Alkalinity (ppm)</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="alkalinity.min" className="block text-sm font-medium text-slate-700">Minimum Value</label>
                                        <input type="number" name="alkalinity.min" id="alkalinity.min" value={settings.alkalinity.min} onChange={handleStandardChange} required className={inputClasses}/>
                                    </div>
                                    <div>
                                        <label htmlFor="alkalinity.max" className="block text-sm font-medium text-slate-700">Maximum Value</label>
                                        <input type="number" name="alkalinity.max" id="alkalinity.max" value={settings.alkalinity.max} onChange={handleStandardChange} required className={inputClasses}/>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset className="space-y-4 p-4 border border-slate-200 rounded-lg">
                                <legend className="text-lg font-semibold text-slate-800 px-2">Hardness</legend>
                                <div>
                                    <label htmlFor="hardness.max" className="block text-sm font-medium text-slate-700">Maximum Acceptable Value</label>
                                    <select name="hardness.max" id="hardness.max" value={settings.hardness.max} onChange={handleStandardChange} required className={inputClasses}>
                                        <option value="0">0 ppm (Soft)</option>
                                        <option value="1">1 ppm</option>
                                        <option value="2">2+ ppm (Hard)</option>
                                    </select>
                                    <p className="mt-2 text-xs text-slate-600">Any value greater than this will be marked as out of spec.</p>
                                </div>
                            </fieldset>
                        </div>
                    )}
                    {activeTab === 'custom' && (
                        <div className="space-y-8" aria-labelledby="custom-settings-title">
                             <h2 id="custom-settings-title" className="text-2xl font-bold text-slate-900">Custom Test Parameters</h2>
                            <div className="p-4 border border-slate-200 rounded-lg space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800">Add New Parameter</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                                    <div className="lg:col-span-2">
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Parameter Name</label>
                                        <input type="text" name="name" placeholder="e.g., pH" value={newCustomParam.name} onChange={handleNewCustomParamChange} className={inputClasses}/>
                                    </div>
                                    <div>
                                        <label htmlFor="unit" className="block text-sm font-medium text-slate-700">Unit</label>
                                        <input type="text" name="unit" placeholder="e.g., pH units" value={newCustomParam.unit} onChange={handleNewCustomParamChange} className={inputClasses}/>
                                    </div>
                                    <div>
                                        <label htmlFor="min" className="block text-sm font-medium text-slate-700">Min Value</label>
                                        <input type="number" name="min" placeholder="e.g., 7.0" value={newCustomParam.min} onChange={handleNewCustomParamChange} className={inputClasses}/>
                                    </div>
                                    <div>
                                        <label htmlFor="max" className="block text-sm font-medium text-slate-700">Max Value</label>
                                        <input type="number" name="max" placeholder="e.g., 8.5" value={newCustomParam.max} onChange={handleNewCustomParamChange} className={inputClasses}/>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <button type="button" onClick={addCustomParameter} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Add Parameter</button>
                                </div>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-lg space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800">Existing Custom Parameters</h3>
                                {settings.custom.length > 0 ? (
                                    <ul className="space-y-3">
                                        {settings.custom.map(param => (
                                            <li key={param.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                                <div>
                                                    <span className="font-semibold text-slate-800">{param.name}</span>
                                                    <span className="text-sm text-slate-600 ml-2">({param.unit})</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                     <span className="text-sm text-slate-600">Range: {param.min} - {param.max}</span>
                                                     <button type="button" onClick={() => removeCustomParameter(param.id)} className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400">Remove</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No custom parameters have been added yet.</p>
                                )}
                            </div>
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
