import React, { useRef } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  period: number;
}

const DebouncedInput = ({ period, onChange, ...props }: Props) => {
  const timeout = useRef(0);
  const handleChange = onChange
    ? (e: React.ChangeEvent<HTMLInputElement>) => {
        clearTimeout(timeout.current);
        timeout.current = window.setTimeout(() => onChange(e), period);
      }
    : undefined;
  return <input onChange={handleChange} {...props} />;
};

export default DebouncedInput;
