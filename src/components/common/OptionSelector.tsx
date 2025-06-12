import React, { useMemo } from 'react';
import { OptionItem, TimeRangeOptions } from '@/types/overview';

type OptionSelectorProps = {
    options: Record<string, string>;
    value: string;
    onChange: (val: string) => void;
    loading: boolean
};

type TimeOptionSelectorProps = {
    loading: boolean;
    options: TimeRangeOptions;
    selectedTime: string;
    onTimeChange: (time: string) => void;
};


export const OptionSelector: React.FC<OptionSelectorProps> = ({ options, value, onChange, loading }) => {

    return (
        <div className="option-selector">
            {Object.entries(options).map(([key, label]) => (
                <button
                    key={key}
                    className={`option-btn ${value === key ? 'selected' : ''}`}
                    onClick={() => onChange(key)}
                    disabled={loading}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};


export const TimeOptionSelector: React.FC<TimeOptionSelectorProps> = ({
    loading,
    options,
    selectedTime,
    onTimeChange,
}) => {
    const optionDict = React.useMemo(() => {
        const dict: Record<string, string> = {};
        Object.keys(options).forEach((key) => {
            dict[key] = options[key].label;
        });
        return dict;
    }, [options]);
    return (
        <>
            <OptionSelector
                options={optionDict}
                value={selectedTime}
                onChange={onTimeChange}
                loading={loading}
            />

        </>

    );
};
