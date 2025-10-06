import React, { useState, useEffect, useRef } from 'react';
import { WaterTestEntry, WeeklyEvaporationLog, TestParameters, CommentLog, ParameterRange, EntryView } from '../types';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import { DropletIcon } from '../components/icons/DropletIcon';
import { FireIcon } from '../components/icons/FireIcon';
import { SunIcon } from '../components/icons/SunIcon';
import { PowerIcon } from '../components/icons/PowerIcon';
import { CommentIcon } from '../components/icons/CommentIcon';

interface NewEntryProps {
    onAddWaterTest: (entry: Omit<WaterTestEntry, 'id'>) => void;
    onAddWeeklyEvaporationLog: (entry: Omit<WeeklyEvaporationLog, 'id'>) => void;
    onAddCommentLog: (entry: Omit<CommentLog, 'id'>) => void;
    settings: TestParameters;
    onSaveSuccess: () => void;
    newEntryTarget: EntryView | null;
    clearNewEntryTarget: () => void;
}

type ValidationState = 'default' | 'in-spec' | 'out-of-spec';

// --- Reusable Components ---
const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none text-slate-900 transition-colors duration-200";
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="flex items-center text-sm font-semibold text-sky-600 hover:text-sky-800 mb-6">
        <ArrowLeftIcon className="mr-2" />
        Back to Selection
    </button>
);
const PageTitle: React.FC<{ title: string }> = ({ title }) => <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>;
const Fieldset: React.FC<{ legend: string, children: React.ReactNode }> = ({ legend, children }) => (
     <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
        <div className="bg-slate-700 px-6 py-3">
            <h3 className="text-lg font-semibold text-white">{legend}</h3>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </div>
    </div>
);
const FormInput: React.FC<{ label: string, name: string, type?: string, value: any, onChange: (e: any) => void, required?: boolean, children?: React.ReactNode, validationState?: ValidationState }> = 
    ({ label, name, type = "text", value, onChange, required = false, children, validationState = 'default' }) => {

    const validationClasses = {
        'default': 'focus:ring-sky-500 focus:border-sky-500',
        'in-spec': 'border-green-500 ring-2 ring-green-200 focus:border-green-600 focus:ring-green-500',
        'out-of-spec': 'border-red-500 ring-2 ring-red-200 focus:border-red-600 focus:ring-red-500'
    };
    
    const combinedClasses = `${baseInputClasses} ${validationClasses[validationState]}`;

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-600">{label}</label>
            {children ? (
                <select name={name} id={name} value={value} onChange={onChange} required={required} className={combinedClasses}>
                    {children}
                </select>
            ) : (
                <input type={type} name={name} id={name} value={value} onChange={onChange} required={required} className={combinedClasses} />
            )}
        </div>
    );
};
const FormToggle: React.FC<{ label: string, name: string, value: string, options: string[], onChange: (name: string, value: string) => void }> = 
    ({ label, name, value, options, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">{label}</label>
        <div className="flex items-center space-x-2">
            {options.map(option => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(name, option)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${value === option ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

// --- Validation Helper ---
const getValidationState = (
    value: string | number,
    spec?: ParameterRange
): ValidationState => {
    if (value === '' || value === null || value === undefined || !spec) {
        return 'default';
    }
    const numValue = Number(value);
    if (isNaN(numValue)) {
        return 'default';
    }
    if (numValue >= spec.min && numValue <= spec.max) {
        return 'in-spec';
    }
    return 'out-of-spec';
};


// --- Water Test Form ---
const getInitialWaterTestState = () => ({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    boilerName: 'Beel' as 'Beel' | 'Cradley',
    testedByUserId: '',
    boilerStartTime: '24',
    mainGasReading: '',
    sulphite: '',
    alkalinity: '',
    boilerPh: '',
    tdsProbeReadout: '',
    tdsLevelCheck: '',
    feedWaterHardness: '',
    feedWaterPh: '',
    boilerSoftenerHardness: '',
    boilerSoftenerUnitInService: 1 as 1 | 2,
    boilerSoftenerLitresUntilRegen: '',
    boilerSoftenerSaltBagsAdded: '',
    condensateHardness: '',
    condensateTds: '',
    condensatePh: '',
    brewerySoftenerHardness: 'Soft' as 'Soft' | 'Hard',
    brewerySoftenerUnitInService: 1 as 1 | 2,
    nalco77211: '',
    nexGuard22310: '',
    waterAdded: '',
    waterFeedPump: 'Working' as 'Working' | 'Not Working',
    chemicalDosingPump: 'Working' as 'Working' | 'Not Working',
    flameDetector: 'Working' as 'Working' | 'Not Working',
    tdsProbeCheck: 'Checked' as 'Checked' | 'Not Checked',
    leftSightGlass: 'Completed' as 'Completed' | 'Not Completed',
    rightSightGlass: 'Completed' as 'Completed' | 'Not Completed',
    bottomBlowdown: 'Completed' as 'Completed' | 'Not Completed',
    tocMonitorChecked: false,
    spotSampleTaken: false,
    compositeSampleTaken: false,
    commentText: '',
});

const WaterTestForm: React.FC<{ onAddWaterTest: NewEntryProps['onAddWaterTest'], onAddCommentLog: NewEntryProps['onAddCommentLog'], settings: TestParameters, onBack: () => void, onSaveSuccess: () => void }> = ({ onAddWaterTest, onAddCommentLog, settings, onBack, onSaveSuccess }) => {
    const [form, setForm] = useState(getInitialWaterTestState());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setForm(prev => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
    };
    
    const handleToggleChange = (name: string, value: any) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Convert string number fields to actual numbers
        const numericFields = ['mainGasReading', 'sulphite', 'alkalinity', 'boilerPh', 'tdsProbeReadout', 'tdsLevelCheck', 'feedWaterHardness', 'feedWaterPh', 'boilerSoftenerHardness', 'boilerSoftenerLitresUntilRegen', 'boilerSoftenerSaltBagsAdded', 'condensateHardness', 'condensateTds', 'condensatePh', 'nalco77211', 'nexGuard22310', 'waterAdded'];
        const processedForm: any = { ...form };
        numericFields.forEach(field => {
            if (processedForm[field] !== '' && processedForm[field] !== undefined && processedForm[field] !== null) {
                processedForm[field] = Number(processedForm[field]);
            } else {
                 delete processedForm[field]; // Remove empty optional fields
            }
        });

        onAddWaterTest(processedForm);

        if (form.commentText.trim()) {
            onAddCommentLog({
                timestamp: new Date().toISOString(),
                userId: form.testedByUserId,
                source: 'Water Test',
                text: form.commentText.trim(),
            });
        }
        
        onSaveSuccess();
    };

    return (
        <div>
            <BackButton onClick={onBack} />
            <PageTitle title="Daily Water Test Log" />
            <form onSubmit={handleSubmit} className="space-y-8">
                
                <Fieldset legend="General Information">
                    <FormInput label="Which Boiler is Being Tested" name="boilerName" value={form.boilerName} onChange={handleChange} required>
                        <option value="Beel">Beel</option>
                        <option value="Cradley">Cradley</option>
                    </FormInput>
                    <FormInput label="Authorized User Name" name="testedByUserId" value={form.testedByUserId} onChange={handleChange} required>
                        <option value="" disabled>Select User...</option>
                        {settings.authorizedUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </FormInput>
                    <FormInput label="Boiler Start Time (24 for 24 hours)" name="boilerStartTime" value={form.boilerStartTime} onChange={handleChange} required />
                    <FormInput label="Main Gas Reading (m3)" name="mainGasReading" type="number" value={form.mainGasReading} onChange={handleChange} />
                </Fieldset>

                <Fieldset legend="Water Tests">
                    <FormInput label="Sulphite Level (PPM)" name="sulphite" type="number" value={form.sulphite} onChange={handleChange} validationState={getValidationState(form.sulphite, settings.sulphite)} />
                    <FormInput label="Alkalinity Level (PPM)" name="alkalinity" type="number" value={form.alkalinity} onChange={handleChange} validationState={getValidationState(form.alkalinity, settings.alkalinity)} />
                    <FormInput label="Boiler Ph (Ph)" name="boilerPh" type="number" value={form.boilerPh} onChange={handleChange} validationState={getValidationState(form.boilerPh, settings.boilerPh)} />
                    <FormInput label="TDS Probe Readout (PPM)" name="tdsProbeReadout" type="number" value={form.tdsProbeReadout} onChange={handleChange} validationState={getValidationState(form.tdsProbeReadout, settings.tdsProbeReadout)} />
                    <FormInput label="TDS Level Check (PPM)" name="tdsLevelCheck" type="number" value={form.tdsLevelCheck} onChange={handleChange} validationState={getValidationState(form.tdsLevelCheck, settings.tdsLevelCheck)} />
                </Fieldset>
                
                <Fieldset legend="Feed Water">
                    <FormInput label="Hardness (PPM)" name="feedWaterHardness" type="number" value={form.feedWaterHardness} onChange={handleChange} validationState={getValidationState(form.feedWaterHardness, settings.feedWaterHardness)} />
                    <FormInput label="Feed Water Ph (Ph)" name="feedWaterPh" type="number" value={form.feedWaterPh} onChange={handleChange} validationState={getValidationState(form.feedWaterPh, settings.feedWaterPh)} />
                </Fieldset>

                <Fieldset legend="Boiler Softeners">
                    <FormInput label="Hardness (PPM)" name="boilerSoftenerHardness" type="number" value={form.boilerSoftenerHardness} onChange={handleChange} validationState={getValidationState(form.boilerSoftenerHardness, settings.boilerSoftenerHardness)} />
                    <FormInput label="Unit in Service" name="boilerSoftenerUnitInService" value={form.boilerSoftenerUnitInService} onChange={handleChange} >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                    </FormInput>
                    <FormInput label="Litres Until Regeneration (Lts)" name="boilerSoftenerLitresUntilRegen" type="number" value={form.boilerSoftenerLitresUntilRegen} onChange={handleChange} />
                    <FormInput label="Bags of Salt Added (25Kg)" name="boilerSoftenerSaltBagsAdded" type="number" value={form.boilerSoftenerSaltBagsAdded} onChange={handleChange} />
                </Fieldset>

                <Fieldset legend="Brewhouse Condensate">
                    <FormInput label="Condensate Hardness Check (PPM)" name="condensateHardness" type="number" value={form.condensateHardness} onChange={handleChange} validationState={getValidationState(form.condensateHardness, settings.condensateHardness)} />
                    <FormInput label="Condensate TDS (PPM)" name="condensateTds" type="number" value={form.condensateTds} onChange={handleChange} validationState={getValidationState(form.condensateTds, settings.condensateTds)} />
                    <FormInput label="Condensate Ph (Ph)" name="condensatePh" type="number" value={form.condensatePh} onChange={handleChange} validationState={getValidationState(form.condensatePh, settings.condensatePh)} />
                </Fieldset>

                <Fieldset legend="Brewery Softeners">
                    <FormToggle label="Hardness" name="brewerySoftenerHardness" value={form.brewerySoftenerHardness} options={['Soft', 'Hard']} onChange={handleToggleChange} />
                    <FormInput label="Unit in Service" name="brewerySoftenerUnitInService" value={form.brewerySoftenerUnitInService} onChange={handleChange} >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                    </FormInput>
                </Fieldset>
                
                <Fieldset legend="Chemical Added">
                    <FormInput label="NALCO 77211 (Lts)" name="nalco77211" type="number" value={form.nalco77211} onChange={handleChange} />
                    <FormInput label="NexGuard 22310 (Lts)" name="nexGuard22310" type="number" value={form.nexGuard22310} onChange={handleChange} />
                    <FormInput label="Water Added (Lts)" name="waterAdded" type="number" value={form.waterAdded} onChange={handleChange} />
                </Fieldset>

                <Fieldset legend="Ancillaries">
                    <FormToggle label="Water Feed Pump" name="waterFeedPump" value={form.waterFeedPump} options={['Working', 'Not Working']} onChange={handleToggleChange} />
                    <FormToggle label="Chemical Dosing Pump" name="chemicalDosingPump" value={form.chemicalDosingPump} options={['Working', 'Not Working']} onChange={handleToggleChange} />
                    <FormToggle label="Flame Detector" name="flameDetector" value={form.flameDetector} options={['Working', 'Not Working']} onChange={handleToggleChange} />
                    <FormToggle label="TDS Probe Check" name="tdsProbeCheck" value={form.tdsProbeCheck} options={['Checked', 'Not Checked']} onChange={handleToggleChange} />
                </Fieldset>
                
                <Fieldset legend="Blowdown">
                    <FormToggle label="Left Sight Glass" name="leftSightGlass" value={form.leftSightGlass} options={['Completed', 'Not Completed']} onChange={handleToggleChange} />
                    <FormToggle label="Right Sight Glass" name="rightSightGlass" value={form.rightSightGlass} options={['Completed', 'Not Completed']} onChange={handleToggleChange} />
                    <FormToggle label="Bottom Blowdown" name="bottomBlowdown" value={form.bottomBlowdown} options={['Completed', 'Not Completed']} onChange={handleToggleChange} />
                </Fieldset>

                <Fieldset legend="Effluent">
                     <ToggleSwitch label="TOC Monitor Checked" name="tocMonitorChecked" value={form.tocMonitorChecked} onChange={handleChange} isBool />
                     <ToggleSwitch label="Spot Sample Taken" name="spotSampleTaken" value={form.spotSampleTaken} onChange={handleChange} isBool />
                     <ToggleSwitch label="Composite Sample Taken" name="compositeSampleTaken" value={form.compositeSampleTaken} onChange={handleChange} isBool />
                </Fieldset>

                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
                    <div className="bg-slate-700 px-6 py-3">
                        <h3 className="text-lg font-semibold text-white">Comments</h3>
                    </div>
                    <div className="p-6">
                        <textarea name="commentText" value={form.commentText} onChange={handleChange} rows={4} className={baseInputClasses} placeholder="Add any relevant comments here..."></textarea>
                    </div>
                </div>

                <div className="flex justify-end items-center pt-4">
                    <button type="submit" className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 text-lg">Save Entry</button>
                </div>
            </form>
        </div>
    );
};

// --- Weekly Evaporation Form ---
const ToggleSwitch: React.FC<{ label: string, name: string, value: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, isBool?: boolean }> = ({ label, name, value, onChange, isBool }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600">{label}</label>
        <div className="mt-2 flex items-center">
             <input type="checkbox" name={name} checked={value} onChange={onChange} className="hidden"/>
             <button type="button" onClick={() => onChange({ target: { name, value: !value, type: 'checkbox', checked: !value } } as any)}
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
        const { name, value, type, checked } = e.target as HTMLInputElement;
        if (type === 'checkbox') {
             setForm({ ...form, [name]: checked });
        } else {
             setForm({ ...form, [name]: value });
        }
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
             <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
                <div className="bg-slate-700 px-8 py-4">
                    <h2 className="text-xl font-bold text-white">Weekly Evaporation Log</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
                            <ToggleSwitch label="Low Water Alarm Worked?" name="lowWaterAlarmWorked" value={form.lowWaterAlarmWorked} onChange={handleChange} />
                            <ToggleSwitch label="Low-Low Water Alarm Worked?" name="lowLowWaterAlarmWorked" value={form.lowLowWaterAlarmWorked} onChange={handleChange} />
                            <ToggleSwitch label="Test Completed?" name="testCompleted" value={form.testCompleted} onChange={handleChange} />
                        </div>
                    </div>
                     <div className="flex justify-end items-center">
                        <button type="submit" className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Save Log</button>
                    </div>
                </form>
            </div>
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
const NewEntry: React.FC<NewEntryProps> = ({ onAddWaterTest, onAddWeeklyEvaporationLog, onAddCommentLog, settings, onSaveSuccess, newEntryTarget, clearNewEntryTarget }) => {
    const [view, setView] = useState<EntryView>('selection');

    useEffect(() => {
        if (newEntryTarget) {
            setView(newEntryTarget);
            clearNewEntryTarget();
        }
    }, [newEntryTarget, clearNewEntryTarget]);

    const renderContent = () => {
        switch (view) {
            case 'selection':
                return <NewEntrySelection setView={setView} />;
            case 'waterTest':
                return <WaterTestForm onAddWaterTest={onAddWaterTest} onAddCommentLog={onAddCommentLog} settings={settings} onBack={() => setView('selection')} onSaveSuccess={onSaveSuccess} />;
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

    return <div className="max-w-7xl mx-auto">{renderContent()}</div>;
};

export default NewEntry;