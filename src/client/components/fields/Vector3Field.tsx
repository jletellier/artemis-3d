import * as React from 'react';
import type { IChangeEvent, ErrorSchema } from 'react-jsonschema-form';
import { Vector3 } from '../Vectors';


// simple version of FieldProps
export interface IVector3FieldProps {
  formData: number[];
  onChange: (e: IChangeEvent<number[]> | any, es?: ErrorSchema) => any;
}

// TODO: show title
export function Vector3Field(props: IVector3FieldProps) {
  const { formData, onChange } = props;
  const copy = [formData[0], formData[1], formData[2]];
  return <Vector3 vector={copy} onChange={onChange} />;
}
