import * as React from 'react';
import type { FieldProps } from 'react-jsonschema-form';
import { Vector3 } from '../Vectors';

export type IVector3FieldProps = Partial<FieldProps>;

// TODO: show title
export function Vector3Field(props: IVector3FieldProps) {
  const {
    formData, onChange, disabled,
  } = props;
  const copy = [formData[0], formData[1], formData[2]];
  return <Vector3 vector={copy} onChange={onChange} disabled={disabled} />;
}
