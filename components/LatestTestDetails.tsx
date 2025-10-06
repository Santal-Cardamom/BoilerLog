
import * as React from 'react';
import { WaterTestEntry, TestParameters, ParameterRange } from '../types';

type ValidatedFields = keyof Omit<TestParameters, 'authorizedUsers' | 'hardness'>;

const getValidationClasses = (
    key: ValidatedFields,
    value: number | undefined | null,
    settings: TestParameters
): string => {
    // FIX: This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.
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

interface LatestTestDetailsProps {
    test: WaterTestEntry;
    settings: TestParameters;
}

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
        displayValue = <span className="text-slate-400">N/A</span>;
    } else if (validationKey && settings) {
        valueClasses = `text-sm font-semibold ${getValidationClasses(validationKey, Number(value), settings)}`;
    }

    return (
        <div className="py-2">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className={`mt-1 ${valueClasses}`}>
                {children ? children : (
                    <>
                        {displayValue} {unit && value !== undefined && value !== null && value !== '' ? unit : ''}
                    </>
                )}
            </dd>
        </div>
    );
};

const Section: React.FC<{ title: string, children: React.ReactNode, columns?: number }> = ({ title, children, columns = 3 }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
        <div className="bg-slate-700 px-6 py-3">
            <h4 className="text-md font-semibold text-white">{title}</h4>
        </div>
        <div className="p-6">
            <dl className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-x-4 gap-y-1`}>
                {children}
            </dl>
        </div>
    </div>
);

const LatestTestDetails: React.FC<LatestTestDetailsProps> = ({ test, settings }) => {
    const getUserNameById = (userId?: string) => {
        if (!userId) return 'N/A';
        const user = settings.authorizedUsers.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString();

    return (
        <div className="space-y-6">
            <Section title="General Information" columns={4}>
                <DetailItem label="Date" value={formatDate(test.date)} />
                <DetailItem label="Time" value={test.time} />
                <DetailItem label="Boiler" value={test.boilerName} />
                <DetailItem label="Tested By" value={getUserNameById(test.testedByUserId)} />
                <DetailItem label="Boiler Start Time" value={test.boilerStartTime} />
                <DetailItem label="Main Gas Reading" value={test.mainGasReading} unit="m³" />
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Section title="Water Tests">
                        <DetailItem label="Sulphite Level" value={test.sulphite} unit="PPM" validationKey="sulphite" settings={settings} />
                        <DetailItem label="Alkalinity Level" value={test.alkalinity} unit="PPM" validationKey="alkalinity" settings={settings} />
                        <DetailItem label="Boiler Ph" value={test.boilerPh} unit="Ph" validationKey="boilerPh" settings={settings} />
                        <DetailItem label="TDS Probe Readout" value={test.tdsProbeReadout} unit="PPM" validationKey="tdsProbeReadout" settings={settings} />
                        <DetailItem label="TDS Level Check" value={test.tdsLevelCheck} unit="PPM" validationKey="tdsLevelCheck" settings={settings} />
                    </Section>

                    <Section title="Feed Water">
                        <DetailItem label="Hardness" value={test.feedWaterHardness} unit="PPM" validationKey="feedWaterHardness" settings={settings} />
                        <DetailItem label="Feed Water Ph" value={test.feedWaterPh} unit="Ph" validationKey="feedWaterPh" settings={settings} />
                    </Section>
                    
                    <Section title="Boiler Softeners">
                        <DetailItem label="Hardness" value={test.boilerSoftenerHardness} unit="PPM" validationKey="boilerSoftenerHardness" settings={settings} />
                        <DetailItem label="Unit in Service" value={test.boilerSoftenerUnitInService} />
                        <DetailItem label="Litres Until Regeneration" value={test.boilerSoftenerLitresUntilRegen} unit="Lts" />
                        <DetailItem label="Bags of Salt Added" value={test.boilerSoftenerSaltBagsAdded} unit="25Kg bags" />
                    </Section>

                     <Section title="Ancillaries">
                        <DetailItem label="Water Feed Pump" value={test.waterFeedPump} />
                        <DetailItem label="Chemical Dosing Pump" value={test.chemicalDosingPump} />
                        <DetailItem label="Flame Detector" value={test.flameDetector} />
                        <DetailItem label="TDS Probe Check" value={test.tdsProbeCheck} />
                    </Section>

                    <Section title="Effluent">
                        <DetailItem label="TOC Monitor Checked" value={test.tocMonitorChecked} />
                        <DetailItem label="Spot Sample Taken" value={test.spotSampleTaken} />
                        <DetailItem label="Composite Sample Taken" value={test.compositeSampleTaken} />
                    </Section>
                </div>

                <div className="space-y-6">
                     <Section title="Brewhouse Condensate">
                        <DetailItem label="Condensate Hardness" value={test.condensateHardness} unit="PPM" validationKey="condensateHardness" settings={settings} />
                        <DetailItem label="Condensate TDS" value={test.condensateTds} unit="PPM" validationKey="condensateTds" settings={settings} />
                        <DetailItem label="Condensate Ph" value={test.condensatePh} unit="Ph" validationKey="condensatePh" settings={settings} />
                    </Section>
                    
                    <Section title="Brewery Softeners">
                        <DetailItem label="Hardness" value={test.brewerySoftenerHardness} />
                        <DetailItem label="Unit in Service" value={test.brewerySoftenerUnitInService} />
                    </Section>

                    <Section title="Chemical Added">
                        <DetailItem label="NALCO 77211" value={test.nalco77211} unit="Lts" />
                        <DetailItem label="NexGuard 22310" value={test.nexGuard22310} unit="Lts" />
                        <DetailItem label="Water Added" value={test.waterAdded} unit="Lts" />
                    </Section>

                    <Section title="Blowdown">
                        <DetailItem label="Left Sight Glass" value={test.leftSightGlass} />
                        <DetailItem label="Right Sight Glass" value={test.rightSightGlass} />
                        <DetailItem label="Bottom Blowdown" value={test.bottomBlowdown} />
                    </Section>
                </div>
            </div>
             {test.commentText && (
                 <Section title="Comments">
                    <div className="col-span-full">
                        <p className="text-sm text-slate-800 italic">"{test.commentText}"</p>
                    </div>
                </Section>
             )}
        </div>
    );
};

export default LatestTestDetails;