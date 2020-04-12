import type { FieldProps } from 'react-jsonschema-form';
import * as React from 'react';
import { useState } from 'react';
import { Vector3, QuaternionVector } from '../Vectors';

// TODO: show title
export function QuaternionField(props: FieldProps<number[]>) {
  const { onChange } = props;
  const [showEuler, setShowEuler] = useState(false);

  let view;

  if (showEuler) {
    const euler = [0, 1, 2];
    // TODO: Quaternion to Euler
    view = (
      <Vector3
        vector={euler}
        onChange={() => /* TODO: euler to quaternion */ onChange([0, 1, 2, 3])}
      />
    );
  } else {
    view = <QuaternionVector vector={props.formData} onChange={onChange} />;
  }
  return (
    <div>
      {view}
      <button
        type="button"
        onClick={() => setShowEuler(!showEuler)}
      >
        {showEuler ? 'Toggle Quaternion' : 'ToggleEuler'}
      </button>
    </div>
  );
}
