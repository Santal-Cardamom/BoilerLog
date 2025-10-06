
import * as React from 'react';
import { TestParameters, AuthorizedUser, ParameterRange } from '../types';

interface SettingsProps {
    settings: TestParameters;
    onSaveSettings: (settings: TestParameters) => void;
}

type ParameterKey = keyof Omit<TestParameters, 'authorizedUsers' | 'hardness'>;

const parameterDisplayNames: Record<ParameterKey, string> = {
  sulphite: "Sulphite (PPM)",
  alkalinity: "Alkalinity (PPM)",
  boilerPh: "Boiler Ph",
  tdsProbeReadout: "TDS Probe Readout (PPM)",
  tdsLevelCheck: "TDS Level Check (PPM)",
  feedWaterHardness: "Feed Water Hardness (PPM)",
  feedWaterPh: "Feed Water Ph",
  boilerSoftenerHardness: "Boiler Softener Hardness (PPM)",
  condensateHardness: "Condensate Hardness (PPM)",
  condensateTds: "Condensate TDS (PPM)",
  condensatePh: "Condensate Ph",
};

const Settings: React.FC<SettingsProps> = ({ settings, onSaveSettings }) => {
    const [localSettings, setLocalSettings] = React.useState<TestParameters>(settings);
    const [isDirty, setIsDirty] = React.useState(false);

    React.useEffect(() => {
        setIsDirty(JSON.stringify(settings) !== JSON.stringify(localSettings));
    }, [localSettings, settings]);

    const handleRangeChange = (testKey: ParameterKey, field: keyof ParameterRange, value: string) => {
        const numValue = value === '' ? 0 : parseFloat(value);
        if (!isNaN(numValue)) {
            setLocalSettings(prev => ({
                ...prev,
                [testKey]: {
                    ...(prev[testKey] as ParameterRange),
                    [field]: numValue
                }
            }));
        }
    };

    const handleUserChange = (index: number, field: keyof Omit<AuthorizedUser, 'id'>, value: string) => {
        const newUsers = [...localSettings.authorizedUsers];
        newUsers[index] = { ...newUsers[index], [field]: value };
        setLocalSettings(prev => ({ ...prev, authorizedUsers: newUsers }));
    };

    const handleAddUser = () => {
        const newUser: AuthorizedUser = { id: `new-${Date.now()}`, name: '' };
        setLocalSettings(prev => ({ ...prev, authorizedUsers: [...prev.authorizedUsers, newUser] }));
    };



    const handleRemoveUser = (id: string) => {
        setLocalSettings(prev => ({
            ...prev,
            authorizedUsers: prev.authorizedUsers.filter(user => user.id !== id)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const settingsToSave = {
            ...localSettings,
            authorizedUsers: localSettings.authorizedUsers
                .map(u => ({ ...u, name: u.name.trim() })) // Trim names
                .filter(u => u.name) // Remove empty names
                .map((u, i) => ({ ...u, id: u.id.startsWith('new-') ? `${i + 1}` : u.id })) // Assign proper IDs
        };
        onSaveSettings(settingsToSave);
        setLocalSettings(settingsToSave); // Update local state with saved data (e.g., new IDs)
    };
    
    const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900";

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Parameter Ranges */}
                <div className="bg-white rounded-lg shadow-md border border-slate-200">
                    <div className="bg-slate-700 px-6 py-3">
                        <h3 className="text-lg font-semibold text-white">Parameter Ranges</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.keys(parameterDisplayNames).map(key => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-slate-600">{parameterDisplayNames[key as ParameterKey]}</label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Min"
                                        value={localSettings[key as ParameterKey].min}
                                        onChange={(e) => handleRangeChange(key as ParameterKey, 'min', e.target.value)}
                                        className={baseInputClasses}
                                    />
                                    <span className="text-slate-400">-</span>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Max"
                                        value={localSettings[key as ParameterKey].max}
                                        onChange={(e) => handleRangeChange(key as ParameterKey, 'max', e.target.value)}
                                        className={baseInputClasses}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Authorized Users */}
                <div className="bg-white rounded-lg shadow-md border border-slate-200">
                     <div className="bg-slate-700 px-6 py-3 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">Authorized Users</h3>
                        <button type="button" onClick={handleAddUser} className="px-3 py-1 bg-sky-500 text-white text-sm font-semibold rounded-md hover:bg-sky-600">Add User</button>
                    </div>
                    <div className="p-6 space-y-3">
                        {localSettings.authorizedUsers.map((user, index) => (
                            <div key={user.id} className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    placeholder="User Name"
                                    value={user.name}
                                    onChange={(e) => handleUserChange(index, 'name', e.target.value)}
                                    className={`${baseInputClasses} flex-grow`}
                                />
                                <button type="button" onClick={() => handleRemoveUser(user.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Remove</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={!isDirty} className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
