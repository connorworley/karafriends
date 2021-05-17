import React, { forwardRef, useRef } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  inputRef?: React.RefObject<HTMLInputElement>;
  period: number;
}

const DebouncedInput = ({ inputRef, period, onChange, ...props }: Props) => {
  const timeout = useRef(0);
  const handleChange = onChange
    ? (e: React.ChangeEvent<HTMLInputElement>) => {
        clearTimeout(timeout.current);
        timeout.current = window.setTimeout(() => onChange(e), period);
      }
    : undefined;
  return <input ref={inputRef} onChange={handleChange} {...props} />;
};

export default DebouncedInput;
