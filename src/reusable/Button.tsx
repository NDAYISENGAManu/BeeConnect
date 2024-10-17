import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  name?: string;
  value?: string;
  id?: string;
  className?: string; 
  styles?: React.CSSProperties; 
  onClick?: React.MouseEventHandler<HTMLButtonElement>; 
}

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  name,
  value,
  id,
  className="px-4 py-2 border rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500",
  styles,
  onClick
}) => {
  return (
    <button
      type={type}
      name={name}
      id={id}
      className={className}
      style={styles}
      onClick={onClick}
    >
      {value}
    </button>
  );
};

export default Button;
