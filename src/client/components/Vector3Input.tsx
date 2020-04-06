import * as React from 'react';
import { FunctionComponent, ChangeEvent } from 'react';

import { Vector3IndexState, Vector3State } from '../stores/stateTypes';

interface IVector3InputProps {
  value: Vector3State,
  onChange: (field: Vector3IndexState, newValue: number) => void,
}

const Vector3Input: FunctionComponent<IVector3InputProps> = (props: IVector3InputProps) => {
  const { value, onChange } = props;

  function handleChange(field: Vector3IndexState, e: ChangeEvent<HTMLInputElement>) {
    const newValue = +e.target.value;
    onChange(field, newValue);
  }

  const handleChangeVecX = (e: ChangeEvent<HTMLInputElement>) => handleChange('x', e);
  const handleChangeVecY = (e: ChangeEvent<HTMLInputElement>) => handleChange('y', e);
  const handleChangeVecZ = (e: ChangeEvent<HTMLInputElement>) => handleChange('z', e);

  return (
    <div>
      X:
      <input
        className="bp3-input"
        type="number"
        step="0.1"
        value={value.x}
        onChange={handleChangeVecX}
      />
      Y:
      <input
        className="bp3-input"
        type="number"
        step="0.1"
        value={value.y}
        onChange={handleChangeVecY}
      />
      Z:
      <input
        className="bp3-input"
        type="number"
        step="0.1"
        value={value.z}
        onChange={handleChangeVecZ}
      />
    </div>
  );
};

export default Vector3Input;
