import Form, { UiSchema, Field } from 'react-jsonschema-form';
import * as React from 'react';
import type { JSONSchema6 } from 'json-schema';
import type { ILensViewProps } from './LensView';

export function createComponent<TFocus>(displayName: string, schema: JSONSchema6,
  uiSchema?: UiSchema, fields?: Record<string, Field>) {
  function Component(props: ILensViewProps<TFocus>) {
    const { focus, onUpdate } = props;
    return (
      <Form
        formData={focus}
        schema={schema}
        uiSchema={uiSchema}
        fields={fields}
        onChange={(e) => { onUpdate(e.formData); }}
      >
        <span />

      </Form>
    );
  }

  Component.displayName = displayName;
  return Component;
}
