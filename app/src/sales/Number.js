import React, { useState, useEffect } from "react";

const NumberInput = ({ value: externalValue, onChange }) => {
  const [value, setValue] = useState(externalValue || 0);

  useEffect(() => {
    if (externalValue !== undefined) {
      setValue(externalValue);
    }
  }, [externalValue]);

  const handleIncrease = () => {
    const newValue = value + 1;
    setValue(newValue);
    onChange(newValue);
  };

  const handleDecrease = () => {
    if (value > 0) {
      const newValue = value - 1;
      setValue(newValue);
      onChange(newValue);
    }
  };

  const handleChange = (event) => {
    const newValue = Number(event.target.value);
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="numBtn_wrap">
      <button onClick={handleDecrease}>-</button>
      <input min="0" type="number" value={value} onChange={handleChange} />
      <button onClick={handleIncrease}>+</button>
    </div>
  );
};

export default NumberInput;
