import React from "react";
import { Input } from "antd";
import { Controller, Control, FieldValues, FieldError } from "react-hook-form";

interface ControlledInputProps<T> {
  control: Control<T>;
  name: keyof T;
  label: string;
  placeholder: string;
  rules?: any; // Make rules optional
}

const ControlledInput = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  rules = {}, // Default to an empty object if rules are not provided
}: ControlledInputProps<T>) => (
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
          <Input
            {...field}
            placeholder={placeholder}
            className="mb-2 h-10 w-full rounded border border-gray-300 px-4 py-2"
          />
          {fieldState.error && (
            <span className="text-red-500">{fieldState.error.message}</span>
          )}
        </div>
      )}
    />
  </div>
);

export default ControlledInput;
