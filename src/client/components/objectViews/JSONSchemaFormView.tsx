import Form, {
  UiSchema, Field, IChangeEvent,
} from 'react-jsonschema-form';
import * as React from 'react';
import clone from 'lodash.clone';
import merge from 'lodash.merge';
import type { JSONSchema6 } from 'json-schema';
import type { ILensViewProps } from './LensView';
import { FieldWrapper } from './FieldWrapper';
import { setFieldEnabled, setFieldVisibility, hideBySearchterm } from './fields';
import { createCombinedSchema, ICombinedSchema } from './CombinedSchema';

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

// TODO: make recursive
function handleMissingPropertiesUI<TFormData>(combSchema: ICombinedSchema,
  formData: TFormData, directive: MissingPropertiesDirective) {
  switch (directive) {
    case MissingPropertiesDirective.DISABLE_AND_IGNORE:
    case MissingPropertiesDirective.DISABLE_AND_ADD_DEFAULTS:
      if (combSchema.properties) {
        combSchema.properties.forEach((prop) => {
          if (!(prop.propName in formData)) { setFieldEnabled(prop, false); }
        });
      }
      break;
    case MissingPropertiesDirective.HIDE_AND_IGNORE:
    case MissingPropertiesDirective.HIDE_AND_ADD_DEFAULTS:
      if (combSchema.properties) {
        combSchema.properties.forEach((prop) => {
          if (!(prop.propName in formData)) { setFieldVisibility(prop, false); }
        });
      }
      break;
    default:
      break;
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
    const { focus, onUpdate, fieldFilter } = props;

    const combSchema = createCombinedSchema(options.schema);

    // merging in the uiSchema
    merge(combSchema.uiSchema, options.uiSchema);

    // missing properties
    const directive = options.missingPropertiesDirective
      || MissingPropertiesDirective.HIDE_AND_IGNORE;
    handleMissingPropertiesUI(combSchema, focus, directive);

    // search filter
    if (fieldFilter) { hideBySearchterm(combSchema, fieldFilter); }

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
        uiSchema={combSchema.uiSchema}
        fields={options.fields}
        FieldTemplate={FieldWrapper}
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
