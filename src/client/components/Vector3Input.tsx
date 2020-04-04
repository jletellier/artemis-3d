import * as React from 'react';
import { FunctionComponent, ChangeEvent } from 'react';
import { Button } from '@blueprintjs/core';

import { StateVector3IndexType, StateVector3Type } from '../stores/sceneStore';

interface IVector3InputProps {
    value: StateVector3Type,
    onChange: (field: StateVector3IndexType, newValue: number) => void,
}

const Vector3Input: FunctionComponent<IVector3InputProps> = (props) => {
    const { value, onChange } = props;

    function handleChange(field: StateVector3IndexType, e: ChangeEvent<HTMLInputElement>) {
        const newValue = +e.target.value;
        onChange(field, newValue);
    }

    const handleChangeVecX = (e: ChangeEvent<HTMLInputElement>) => handleChange('x', e);
    const handleChangeVecY = (e: ChangeEvent<HTMLInputElement>) => handleChange('y', e);
    const handleChangeVecZ = (e: ChangeEvent<HTMLInputElement>) => handleChange('z', e);

    return (<div>
        X: <input className="bp3-input" type="number" step="0.1" value={value.x} 
            onChange={handleChangeVecX} />
        Y: <input className="bp3-input" type="number" step="0.1" value={value.y} 
            onChange={handleChangeVecY} />
        Z: <input className="bp3-input" type="number" step="0.1" value={value.z} 
            onChange={handleChangeVecZ} />
    </div>);
}

export default Vector3Input;
