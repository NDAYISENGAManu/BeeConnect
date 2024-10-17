import React from "react";
import { Select } from "antd";
import { Controller, Control, FieldValues } from "react-hook-form";

interface ControlledSelectProps<T> {
  control: Control<T>;
  name: keyof T;
  label: string;
  options: { value: any; label: string }[];
  placeholder: string;
  rules?: any; // Make rules optional
  mode?: "multiple" | "tags" | undefined;
  onChange?: (value: any) => void; // Add onChange here if needed
}

const ControlledSelect = <T extends FieldValues>({
  control,
  name,
  label,
  options,
  mode,
  placeholder,
  rules = {}, // Default to an empty object if rules are not provided
  onChange, // Accept onChange if provided
}: ControlledSelectProps<T>) => (
  <div className="form-group">
    <label className="block mb-2 text-sm font-bold text-[#0C743F]">
      <span className="font-bold text-xl text-[#FF0000]">*</span> {label}
    </label>
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <div>
          <Select
            {...field}
            mode={mode}
            placeholder={placeholder}
            options={options}
            className="h-10 w-full bg-white"
            onChange={(value) => {
              field.onChange(value); // Call field.onChange
              if (onChange) onChange(value); // Call onChange if provided
            }}
          />
          {fieldState.error && (
            <span className="text-red-500">{fieldState.error.message}</span>
          )}
        </div>
      )}
    />
  </div>
);

export default ControlledSelect;
