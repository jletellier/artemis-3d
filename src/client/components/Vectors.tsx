import * as React from 'react';

const DEFAULT_STEP_SIZE = 0.1;

export interface IVectorProps {
  vector: number[];
  onChange: (vector: number[]) => void;
  stepSize?: number;
  disabled?: boolean;
}

export interface INamedVectorProps extends IVectorProps {
  names: string[];
}

export function NamedVector(props: INamedVectorProps) {
  const { vector, disabled } = props; // TODO: make a copy?
  const elements = vector.map((elem, i) => (
    <span key={props.names[i]}>
      {props.names[i]}
      :
      <input
        className="bp3-input"
        type="number"
        step={`${props.stepSize || DEFAULT_STEP_SIZE}`} // logical or is okay here, as stepSize of 0 doesn't make sense anyway
        value={elem}
        // eslint-disable-next-line no-param-reassign
        onChange={(e) => { props.vector[i] = +e.target.value; props.onChange(props.vector); }}
        disabled={disabled}
      />
    </span>
  ));

  return <div>{elements}</div>;
}


export function Vector2(props: IVectorProps) {
  // TODO: throw exception if length != 2
  const { vector, onChange, disabled } = props;
  return <NamedVector vector={vector} names={['X', 'Y']} onChange={onChange} disabled={disabled} />;
}

export function Vector3(props: IVectorProps) {
  // TODO: throw exception if length != 3
  const { vector, onChange, disabled } = props;
  return <NamedVector vector={vector} names={['X', 'Y', 'Z']} onChange={onChange} disabled={disabled} />;
}

export function QuaternionVector(props: IVectorProps) {
  // TODO: throw exception if length != 4
  const { vector, onChange, disabled } = props;
  return <NamedVector vector={vector} names={['X', 'Y', 'Z', 'W']} onChange={onChange} disabled={disabled} />;
}
