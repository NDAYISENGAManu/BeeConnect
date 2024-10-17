import React from 'react';

interface SelectFieldProps {
  id?: string;
  name?: string;
  isRequired?: boolean;
  classname?: string;
  selectType?: string;
  handleChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  selectOptions?: { key: string; value: string }[];
}

const SelectField: React.FC<SelectFieldProps> = ({
  selectType = 'select here',
  id = 'id',
  name = 'name',
  isRequired = true,
  classname = 'w-full mb-3 px-3 py-2 border rounded-sm text-gray-700 focus:outline-none focus:border-green-500',
  handleChange = () => {},
  selectOptions = []
}) => {
  return (
    <select
      id={id}
      name={name}
      className={classname}
      required={isRequired}
      onChange={handleChange}
    >
      <option>{selectType}</option>
      {selectOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.key}
        </option>
      ))}
    </select>
  );
};

export default SelectField;
