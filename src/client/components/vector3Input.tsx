import * as React from 'react';
import { FunctionComponent, ChangeEvent } from 'react';

interface IVector3InputProps {
  value: Array<number>,
  onChange: (field: number, newValue: number) => void,
}

const Vector3Input: FunctionComponent<IVector3InputProps> = (props: IVector3InputProps) => {
  const { value, onChange } = props;

  function handleChange(field: number, e: ChangeEvent<HTMLInputElement>) {
    const newValue = +e.target.value;
    onChange(field, newValue);
  }

  const handleChangeVecX = (e: ChangeEvent<HTMLInputElement>) => handleChange(0, e);
  const handleChangeVecY = (e: ChangeEvent<HTMLInputElement>) => handleChange(1, e);
  const handleChangeVecZ = (e: ChangeEvent<HTMLInputElement>) => handleChange(2, e);

  return (
    <div>
      X:
      <input
        className="bp3-input"
        type="number"
        step="0.1"
        value={value[0]}
        onChange={handleChangeVecX}
      />
      Y:
      <input
        className="bp3-input"
        type="number"
        step="0.1"
        value={value[1]}
        onChange={handleChangeVecY}
      />
      Z:
      <input
        className="bp3-input"
        type="number"
        step="0.1"
        value={value[2]}
        onChange={handleChangeVecZ}
      />
    </div>
  );
};

export { Vector3Input };
