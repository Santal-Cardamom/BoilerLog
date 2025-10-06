import * as React from 'react';
import { WaterTestEntry, TestParameters, ParameterRange } from '../types';

type ValidatedFields = keyof Omit<TestParameters, 'authorizedUsers' | 'hardness'>;

const getValidationClasses = (
    key: ValidatedFields,
    value: number | undefined | null,
    settings: TestParameters
): string => {
    if (value === null || value === undefined) return "text-slate-900";
    
    const numValue = Number(value);
    if (isNaN(numValue)) return "text-slate-900";

    const spec = settings[key] as ParameterRange | undefined;
    if (!spec) return "text-slate-900";

    if (numValue >= spec.min && numValue <= spec.max) {
        return "text-green-600";
    }
    return "text-red-600";
};

// Compact Detail Item
const DetailItem: React.FC<{
    label: string,
    value?: string | number | boolean | null,
    unit?: string,
    children?: React.ReactNode,
    validationKey?: ValidatedFields,
    settings?: TestParameters
}> = ({ label, value, unit, children, validationKey, settings }) => {
    let displayValue: React.ReactNode = value;
    let valueClasses = "text-sm text-slate-900 font-semibold";

    if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
    } else if (value === undefined || value === null || value === '') {
        displayValue = <span className="text-xs text-slate-400">N/A</span>;
    } else if (validationKey && settings) {
        valueClasses = `text-sm font-semibold ${getValidationClasses(validationKey, Number(value), settings)}`;
    }

    return (
        <div className="py-1">
            <dt className="text-xs font-medium text-slate-500 truncate">{label}</dt>
            <dd className={valueClasses}>
                {children ? children : (
                    <>
                        {displayValue} {unit && value !== undefined && value !== null && value !== '' ? ` ${unit}` : ''}
                    </>
                )}
            </dd>
        </div>
    );
};

// Compact Section
const Section: React.FC<{ title: string, children: React.ReactNode, columns?: number }> = ({ title, children, columns = 2 }) => (
    <div>
        <h4 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-1 mb-2">{title}</h4>
        <dl className={`grid grid-cols-2 sm:grid-cols-${columns} gap-x-4 gap-y-1`}>
            {children}
        </dl>
    </div>
);

const LatestTestDetails: React.FC<{ test: WaterTestEntry, settings: TestParameters }> = ({ test, settings }) => {
    const getUserNameById = (userId?: string) => {
        if (!userId) return 'N/A';
        const user = settings.authorizedUsers.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString();

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Latest Test Details</h3>
            <div className="space-y-3">
                <Section title="General Information" columns={4}>
                    <DetailItem label="Date" value={formatDate(test.date)} />
                    <DetailItem label="Time" value={test.time} />
                    <DetailItem label="Boiler" value={test.boilerName} />
                    <DetailItem label="Tested By" value={getUserNameById(test.testedByUserId)} />
                    <DetailItem label="Start Time" value={test.boilerStartTime} />
                    <DetailItem label="Gas Reading" value={test.mainGasReading} unit="m³" />
                </Section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div className="space-y-3">
                        <Section title="Water Tests" columns={2}>
                            <DetailItem label="Sulphite" value={test.sulphite} unit="PPM" validationKey="sulphite" settings={settings} />
                            <DetailItem label="Alkalinity" value={test.alkalinity} unit="PPM" validationKey="alkalinity" settings={settings} />
                            <DetailItem label="Boiler Ph" value={test.boilerPh} unit="Ph" validationKey="boilerPh" settings={settings} />
                            <DetailItem label="TDS Probe" value={test.tdsProbeReadout} unit="PPM" validationKey="tdsProbeReadout" settings={settings} />
                            <DetailItem label="TDS Level Check" value={test.tdsLevelCheck} unit="PPM" validationKey="tdsLevelCheck" settings={settings} />
                        </Section>
                        <Section title="Feed Water" columns={2}>
                            <DetailItem label="Hardness" value={test.feedWaterHardness} unit="PPM" validationKey="feedWaterHardness" settings={settings} />
                            <DetailItem label="Ph" value={test.feedWaterPh} unit="Ph" validationKey="feedWaterPh" settings={settings} />
                        </Section>
                         <Section title="Boiler Softeners" columns={2}>
                            <DetailItem label="Hardness" value={test.boilerSoftenerHardness} unit="PPM" validationKey="boilerSoftenerHardness" settings={settings} />
                            <DetailItem label="Unit in Service" value={test.boilerSoftenerUnitInService} />
                            <DetailItem label="Litres Until Regen" value={test.boilerSoftenerLitresUntilRegen} unit="Lts" />
                            <DetailItem label="Salt Bags Added" value={test.boilerSoftenerSaltBagsAdded} unit="bags" />
                        </Section>
                         <Section title="Chemical Added" columns={2}>
                            <DetailItem label="NALCO 77211" value={test.nalco77211} unit="Lts" />
                            <DetailItem label="NexGuard 22310" value={test.nexGuard22310} unit="Lts" />
                            <DetailItem label="Water Added" value={test.waterAdded} unit="Lts" />
                        </Section>
                    </div>
                    <div className="space-y-3">
                        <Section title="Brewhouse Condensate" columns={2}>
                            <DetailItem label="Hardness" value={test.condensateHardness} unit="PPM" validationKey="condensateHardness" settings={settings} />
                            <DetailItem label="TDS" value={test.condensateTds} unit="PPM" validationKey="condensateTds" settings={settings} />
                            <DetailItem label="Ph" value={test.condensatePh} unit="Ph" validationKey="condensatePh" settings={settings} />
                        </Section>
                        <Section title="Brewery Softeners" columns={2}>
                            <DetailItem label="Hardness" value={test.brewerySoftenerHardness} />
                            <DetailItem label="Unit in Service" value={test.brewerySoftenerUnitInService} />
                        </Section>
                        <Section title="Ancillaries & Blowdown" columns={2}>
                            <DetailItem label="Water Feed Pump" value={test.waterFeedPump} />
                            <DetailItem label="Chem Dosing Pump" value={test.chemicalDosingPump} />
                            <DetailItem label="Flame Detector" value={test.flameDetector} />
                            <DetailItem label="TDS Probe Check" value={test.tdsProbeCheck} />
                            <DetailItem label="Left Sight Glass" value={test.leftSightGlass} />
                            <DetailItem label="Right Sight Glass" value={test.rightSightGlass} />
                            <DetailItem label="Bottom Blowdown" value={test.bottomBlowdown} />
                        </Section>
                        <Section title="Effluent" columns={2}>
                            <DetailItem label="TOC Monitor Checked" value={test.tocMonitorChecked} />
                            <DetailItem label="Spot Sample Taken" value={test.spotSampleTaken} />
                            <DetailItem label="Composite Sample Taken" value={test.compositeSampleTaken} />
                        </Section>
                    </div>
                </div>
                 {test.commentText && (
                     <Section title="Comments" columns={1}>
                        <div className="col-span-full pt-1">
                            <p className="text-sm text-slate-800 italic">"{test.commentText}"</p>
                        </div>
                    </Section>
                 )}
            </div>
        </div>
    );
};

export default LatestTestDetails;