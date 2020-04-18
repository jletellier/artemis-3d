import * as React from 'react';
import type { FieldProps } from 'react-jsonschema-form';
import { Vector3 } from '../Vectors';

export type IVector3FieldProps = Partial<FieldProps>;

// TODO: show title
export function Vector3Field(props: IVector3FieldProps) {
  const {
    formData, onChange, uiSchema, disabled, schema, description,
  } = props;
  const copy = [formData[0], formData[1], formData[2]];
  if (uiSchema['ui:hidden']) {
    return <div />;
  }
  return (
    <div>
      <label className="control-label">{schema.title}</label>
      <Vector3 vector={copy} onChange={onChange} disabled={disabled} />
      {description}
    </div>

  );
}
