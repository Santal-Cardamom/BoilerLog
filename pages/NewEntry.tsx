import React, { useState, useEffect, useRef } from 'react';
import { WaterTestEntry, WeeklyEvaporationLog, TestParameters } from '../types';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import { DropletIcon } from '../components/icons/DropletIcon';
import { FireIcon } from '../components/icons/FireIcon';
import { SunIcon } from '../components/icons/SunIcon';
import { PowerIcon } from '../components/icons/PowerIcon';
import { CommentIcon } from '../components/icons/CommentIcon';

interface NewEntryProps {
    onAddWaterTest: (entry: Omit<WaterTestEntry, 'id'>) => void;
    onAddWeeklyEvaporationLog: (entry: Omit<WeeklyEvaporationLog, 'id'>) => void;
    settings: TestParameters;
    onSaveSuccess: () => void;
}

type EntryView = 'selection' | 'waterTest' | 'dailyBlowdown' | 'weeklyEvaporation' | 'boilerStartUp' | 'boilerShutdown' | 'addComment';

// --- Reusable Components ---
const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900";
const errorInputClasses = "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500";
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="flex items-center text-sm font-semibold text-sky-600 hover:text-sky-800 mb-6">
        <ArrowLeftIcon className="mr-2" />
        Back to Selection
    </button>
);
const PageTitle: React.FC<{ title: string }> = ({ title }) => <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>;

// --- Water Test Form ---
const getInitialWaterTestState = (customParams: TestParameters['custom']) => {
    const customFields: { [key: string]: string } = {};
    customParams.forEach(p => { customFields[p.id] = ''; });
    return {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        sulphite: '',
        alkalinity: '',
        hardness: '',
        testedByUserId: '',
        customFields: customFields,
    };
};

const WaterTestForm: React.FC<{ onAddWaterTest: NewEntryProps['onAddWaterTest'], settings: TestParameters, onBack: () => void, onSaveSuccess: () => void }> = ({ onAddWaterTest, settings, onBack, onSaveSuccess }) => {
    const [form, setForm] = useState(getInitialWaterTestState(settings.custom));
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const newErrors: { [key: string]: boolean } = {};
        const validate = (val: string, min?: number, max?: number) => {
            if (val === '') return false;
            const numVal = Number(val);
            if (isNaN(numVal)) return false;
            if (min !== undefined && numVal < min) return true;
            if (max !== undefined && numVal > max) return true;
            return false;
        };
        newErrors['sulphite'] = validate(form.sulphite, settings.sulphite.min, settings.sulphite.max);
        newErrors['alkalinity'] = validate(form.alkalinity, settings.alkalinity.min, settings.alkalinity.max);
        newErrors['hardness'] = validate(form.hardness, undefined, settings.hardness.max);
        settings.custom.forEach(param => {
            newErrors[param.id] = validate(form.customFields[param.id], param.min, param.max);
        });
        setErrors(newErrors);
    }, [form, settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleCustomFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, customFields: { ...prev.customFields, [name]: value } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const customFieldsAsNumbers: { [key: string]: number } = {};
        for (const paramId in form.customFields) {
            if (form.customFields[paramId] !== '') {
                customFieldsAsNumbers[paramId] = Number(form.customFields[paramId]);
            }
        }
        onAddWaterTest({
            ...form,
            sulphite: Number(form.sulphite),
            alkalinity: Number(form.alkalinity),
            hardness: Number(form.hardness),
            customFields: customFieldsAsNumbers,
        });
        onSaveSuccess();
    };

    return (
        <div>
            <BackButton onClick={onBack} />
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                <PageTitle title="Daily Water Test Log" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-600">Date</label>
                        <input type="date" name="date" id="date" value={form.date} onChange={handleChange} required className={baseInputClasses} />
                    </div>
                    <div>
                        <label htmlFor="time" className="block text-sm font-medium text-slate-600">Time</label>
                        <input type="time" name="time" id="time" value={form.time} onChange={handleChange} required className={baseInputClasses} />
                    </div>
                    <div>
                        <label htmlFor="sulphite" className="block text-sm font-medium text-slate-600">Sulphite (ppm)</label>
                        <input type="number" name="sulphite" id="sulphite" value={form.sulphite} onChange={handleChange} required className={`${baseInputClasses} ${errors.sulphite ? errorInputClasses : ''}`} />
                    </div>
                    <div>
                        <label htmlFor="alkalinity" className="block text-sm font-medium text-slate-600">Alkalinity (ppm)</label>
                        <input type="number" name="alkalinity" id="alkalinity" value={form.alkalinity} onChange={handleChange} required className={`${baseInputClasses} ${errors.alkalinity ? errorInputClasses : ''}`} />
                    </div>
                    <div>
                        <label htmlFor="hardness" className="block text-sm font-medium text-slate-600">Hardness</label>
                        <select name="hardness" id="hardness" value={form.hardness} onChange={handleChange} required className={`${baseInputClasses} ${errors.hardness ? errorInputClasses : ''}`}>
                            <option value="" disabled>Select hardness...</option>
                            <option value="0">0 ppm (Soft)</option>
                            <option value="1">1 ppm</option>
                            <option value="2">2+ ppm (Hard)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="testedByUserId" className="block text-sm font-medium text-slate-600">Tested By</label>
                        <select name="testedByUserId" id="testedByUserId" value={form.testedByUserId} onChange={handleChange} required className={baseInputClasses}>
                            <option value="" disabled>Select User...</option>
                            {settings.authorizedUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                    {settings.custom.map(param => (
                        <div key={param.id}>
                            <label htmlFor={param.id} className="block text-sm font-medium text-slate-600">{param.name} ({param.unit})</label>
                            <input type="number" name={param.id} id={param.id} value={form.customFields[param.id]} onChange={handleCustomFieldChange} className={`${baseInputClasses} ${errors[param.id] ? errorInputClasses : ''}`} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end items-center">
                    <button type="submit" className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Save Entry</button>
                </div>
            </form>
        </div>
    );
};

// --- Weekly Evaporation Form ---
const ToggleSwitch: React.FC<{ label: string, name: string, value: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600">{label}</label>
        <div className="mt-2 flex items-center">
             <input type="checkbox" name={name} checked={value} onChange={onChange} className="hidden"/>
             <button type="button" onClick={() => onChange({ target: { name, value: !value, type: 'checkbox' } } as any)}
                className={`${value ? 'bg-sky-600' : 'bg-slate-300'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}>
                <span className={`${value ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
            </button>
            <span className="ml-3 text-sm font-medium text-slate-800">{value ? 'Yes' : 'No'}</span>
        </div>
    </div>
);


const WeeklyEvaporationForm: React.FC<{ onAddWeeklyEvaporationLog: NewEntryProps['onAddWeeklyEvaporationLog'], settings: TestParameters, onBack: () => void, onSaveSuccess: () => void }> = ({ onAddWeeklyEvaporationLog, settings, onBack, onSaveSuccess }) => {
    const formStartedAt = useRef(new Date().toISOString());
    const [form, setForm] = useState({
        testDate: new Date().toISOString().split('T')[0],
        testTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
        lowWaterAlarmWorked: false,
        lowLowWaterAlarmWorked: false,
        testCompleted: false,
        operatorUserId: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
        } else {
             setForm({ ...form, [name]: value });
        }
    };
    
    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddWeeklyEvaporationLog({
            ...form,
            formStartedAt: formStartedAt.current,
            formFinishedAt: new Date().toISOString(),
        });
        onSaveSuccess();
    };

    return (
        <div>
            <BackButton onClick={onBack} />
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                <PageTitle title="Weekly Evaporation Log" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="testDate" className="block text-sm font-medium text-slate-600">Test Date</label>
                        <input type="date" name="testDate" id="testDate" value={form.testDate} onChange={handleChange} required className={baseInputClasses}/>
                    </div>
                    <div>
                        <label htmlFor="testTime" className="block text-sm font-medium text-slate-600">Test Time</label>
                        <input type="time" name="testTime" id="testTime" value={form.testTime} onChange={handleChange} required className={baseInputClasses}/>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="operatorUserId" className="block text-sm font-medium text-slate-600">Operator</label>
                        <select name="operatorUserId" id="operatorUserId" value={form.operatorUserId} onChange={handleChange} required className={baseInputClasses}>
                            <option value="" disabled>Select User...</option>
                            {settings.authorizedUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-200">
                        <ToggleSwitch label="Low Water Alarm Worked?" name="lowWaterAlarmWorked" value={form.lowWaterAlarmWorked} onChange={handleToggleChange} />
                        <ToggleSwitch label="Low-Low Water Alarm Worked?" name="lowLowWaterAlarmWorked" value={form.lowLowWaterAlarmWorked} onChange={handleToggleChange} />
                        <ToggleSwitch label="Test Completed?" name="testCompleted" value={form.testCompleted} onChange={handleToggleChange} />
                    </div>
                </div>
                 <div className="flex justify-end items-center">
                    <button type="submit" className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Save Log</button>
                </div>
            </form>
        </div>
    );
};

// --- Placeholder Form ---
const PlaceholderForm: React.FC<{ title: string, onBack: () => void }> = ({ title, onBack }) => (
    <div>
        <BackButton onClick={onBack} />
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <PageTitle title={title} />
            <p className="text-slate-500">This feature is coming soon.</p>
        </div>
    </div>
);

// --- Selection Screen ---
const SelectionCard: React.FC<{ title: string, icon: React.ReactNode, onClick: () => void }> = ({ title, icon, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md text-center group hover:shadow-xl hover:bg-sky-50 transition-all duration-300">
        <div className="mb-4 text-sky-500 group-hover:text-sky-600 transition-colors duration-300">{icon}</div>
        <h3 className="font-semibold text-slate-700 group-hover:text-sky-800 transition-colors duration-300">{title}</h3>
    </button>
);

const NewEntrySelection: React.FC<{ setView: (view: EntryView) => void }> = ({ setView }) => {
    const iconProps = { className:"h-12 w-12" };
    const menuItems = [
        { view: 'waterTest', title: 'Daily Water Tests', icon: <DropletIcon {...iconProps}/> },
        { view: 'dailyBlowdown', title: 'Daily Blowdown', icon: <FireIcon {...iconProps}/> },
        { view: 'weeklyEvaporation', title: 'Weekly Evaporation', icon: <SunIcon {...iconProps}/> },
        { view: 'boilerStartUp', title: 'Boiler Start Up', icon: <PowerIcon {...iconProps}/> },
        { view: 'boilerShutdown', title: 'Boiler Shutdown', icon: <PowerIcon {...iconProps} className="h-12 w-12 text-red-500"/> },
        { view: 'addComment', title: 'Add a Comment', icon: <CommentIcon {...iconProps}/> },
    ] as const;

    return (
        <div>
            <PageTitle title="Create New Entry" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => (
                    <SelectionCard key={item.view} title={item.title} icon={item.icon} onClick={() => setView(item.view)}/>
                ))}
            </div>
        </div>
    );
};

// --- Main Component ---
const NewEntry: React.FC<NewEntryProps> = ({ onAddWaterTest, onAddWeeklyEvaporationLog, settings, onSaveSuccess }) => {
    const [view, setView] = useState<EntryView>('selection');

    const renderContent = () => {
        switch (view) {
            case 'selection':
                return <NewEntrySelection setView={setView} />;
            case 'waterTest':
                return <WaterTestForm onAddWaterTest={onAddWaterTest} settings={settings} onBack={() => setView('selection')} onSaveSuccess={onSaveSuccess} />;
            case 'dailyBlowdown':
                return <PlaceholderForm title="Daily Blowdown Log" onBack={() => setView('selection')} />;
            case 'weeklyEvaporation':
                return <WeeklyEvaporationForm onAddWeeklyEvaporationLog={onAddWeeklyEvaporationLog} settings={settings} onBack={() => setView('selection')} onSaveSuccess={onSaveSuccess} />;
            case 'boilerStartUp':
                return <PlaceholderForm title="Boiler Start Up Log" onBack={() => setView('selection')} />;
            case 'boilerShutdown':
                return <PlaceholderForm title="Boiler Shutdown Log" onBack={() => setView('selection')} />;
            case 'addComment':
                return <PlaceholderForm title="Add a Comment" onBack={() => setView('selection')} />;
            default:
                return <NewEntrySelection setView={setView} />;
        }
    };

    return <div className="max-w-4xl mx-auto">{renderContent()}</div>;
};

export default NewEntry;