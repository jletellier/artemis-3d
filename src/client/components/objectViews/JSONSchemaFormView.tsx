import Form, { UiSchema, Field, IChangeEvent } from 'react-jsonschema-form';
import * as React from 'react';
import clone from 'lodash.clone';
import clonedeep from 'lodash.clonedeep';
import type { JSONSchema6 } from 'json-schema';
import type { ILensViewProps } from './LensView';

export enum MissingPropertiesDirective {
  UNSPECIFIED = 0,
  SHOW_AND_IGNORE,
  DISABLE_AND_IGNORE,
  HIDE_AND_IGNORE,
  SHOW_AND_ADD_DEFAULTS,

  // depending on the application adding defaults may cause an instant
  // re-render and thus the object may not be missing properties, which
  // in turn aren't disabled or hidden
  DISABLE_AND_ADD_DEFAULTS,
  HIDE_AND_ADD_DEFAULTS,
}

function hideProperty(schema: UiSchema, propName: string) {
  /* eslint-disable no-param-reassign */

  if (propName in schema) {
    if ('ui:field' in schema[propName]) {
      // custom fields need to do the hiding themselves
      schema[propName]['ui:hidden'] = true;
    } else {
      schema[propName]['ui:widget'] = 'hidden';
    }
  } else {
    schema[propName] = { 'ui:widget': 'hidden' };
  }
  /* eslint-enable no-param-reassign */
}

function disableProperty(schema: UiSchema, propName: string) {
  /* eslint-disable no-param-reassign */
  if (propName in schema) {
    schema[propName]['ui:disabled'] = true;
  } else {
    schema[propName] = { 'ui:disabled': true };
  }
  /* eslint-enable no-param-reassign */
}

function handleMissingPropertiesUI<TFormData>(schema: JSONSchema6, uiSchema: UiSchema,
  formData: TFormData, directive: MissingPropertiesDirective): UiSchema {
  switch (directive) {
    case MissingPropertiesDirective.SHOW_AND_IGNORE:
    case MissingPropertiesDirective.SHOW_AND_ADD_DEFAULTS:
      return uiSchema;
    case MissingPropertiesDirective.DISABLE_AND_IGNORE:
    case MissingPropertiesDirective.DISABLE_AND_ADD_DEFAULTS: {
      const clonedUISchema = clonedeep(uiSchema);
      Object.keys(schema.properties).forEach((propName) => {
        if (!(propName in formData)) { disableProperty(clonedUISchema, propName); }
      });
      return clonedUISchema;
    }
    case MissingPropertiesDirective.HIDE_AND_IGNORE:
    case MissingPropertiesDirective.HIDE_AND_ADD_DEFAULTS:
    default:
    {
      const clonedUISchema = clonedeep(uiSchema);
      Object.keys(schema.properties).forEach((propName) => {
        if (!(propName in formData)) { hideProperty(clonedUISchema, propName); }
      });
      return clonedUISchema;
    }
  }
}

function handleMissingPropertiesResult<TFormData>(schema: JSONSchema6, focus: TFormData,
  result: TFormData, directive: MissingPropertiesDirective) {
  const ignored = directive === MissingPropertiesDirective.SHOW_AND_IGNORE
    || directive === MissingPropertiesDirective.DISABLE_AND_IGNORE
    || directive === MissingPropertiesDirective.HIDE_AND_IGNORE;

  if (ignored) {
    Object.keys(schema.properties).forEach((propName) => {
      // eslint-disable-next-line no-param-reassign
      if (!(propName in focus)) { delete (result as any)[propName]; }
    });
  }
}


export interface JSONSchemaFormViewOptions {
  displayName: string;
  schema: JSONSchema6;
  uiSchema?: UiSchema;
  fields?: Record<string, Field>;
  missingPropertiesDirective?: MissingPropertiesDirective;
}

export function createComponent<TFocus>(options: JSONSchemaFormViewOptions) {
  function Component(props: ILensViewProps<TFocus>) {
    const { focus, onUpdate } = props;

    const directive = options.missingPropertiesDirective
      || MissingPropertiesDirective.HIDE_AND_IGNORE;

    const newUISchema = options.uiSchema
      ? handleMissingPropertiesUI(options.schema, options.uiSchema || {},
        focus, directive)
      : null;

    const onChange = (e: IChangeEvent<TFocus>) => {
      // TODO: default data for missing properties will initially emit a change event (which seems
      // like correct behaviour), but gives an unnecessary event if missing properties are ignored
      // possibly linked to https://github.com/rjsf-team/react-jsonschema-form/issues/1648
      const data = clone(e.formData);
      handleMissingPropertiesResult(options.schema, focus, data, directive);
      onUpdate(data);
    };

    return (
      <Form
        formData={focus}
        schema={options.schema}
        uiSchema={newUISchema}
        fields={options.fields}
        onChange={onChange}
      >
        { /* hiding the submit button */}
        <span />

      </Form>
    );
  }

  Component.displayName = options.displayName;
  return Component;
}
