import Form, {
  UiSchema, Field, IChangeEvent, FieldTemplateProps,
} from 'react-jsonschema-form';
import * as React from 'react';
import clone from 'lodash.clone';
import merge from 'lodash.merge';
import type { JSONSchema6 } from 'json-schema';
import crawl, { Context } from 'tree-crawl';
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
    schema[propName]['ui:hidden'] = true;
  } else {
    schema[propName] = { 'ui:hidden': true };
  }
  /* eslint-enable no-param-reassign */
}

function propertyIsHidden(uiSchema: UiSchema) {
  return uiSchema['ui:widget'] === 'hidden' || uiSchema['ui:hidden'] === true;
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
  formData: TFormData, directive: MissingPropertiesDirective) {
  switch (directive) {
    case MissingPropertiesDirective.DISABLE_AND_IGNORE:
    case MissingPropertiesDirective.DISABLE_AND_ADD_DEFAULTS:
      Object.keys(schema.properties).forEach((propName) => {
        if (!(propName in formData)) { disableProperty(uiSchema, propName); }
      });
      break;
    case MissingPropertiesDirective.HIDE_AND_IGNORE:
    case MissingPropertiesDirective.HIDE_AND_ADD_DEFAULTS:
      Object.keys(schema.properties).forEach((propName) => {
        if (!(propName in formData)) { hideProperty(uiSchema, propName); }
      });
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

interface ICombinedSchema {
  propName: string;
  schema: JSONSchema6;
  uiSchema: UiSchema;
  properties?: ICombinedSchema[];
  parent: ICombinedSchema;
}

function createCombinedSchema(schema: JSONSchema6, propName: string = '', parent: ICombinedSchema = null): ICombinedSchema {
  const uiSchema = {};
  const combSchema: ICombinedSchema = {
    propName, schema, uiSchema, parent,
  };

  // eslint-disable-next-line no-param-reassign
  if (parent) { parent.uiSchema[propName] = uiSchema; }

  // recursively go through the properties
  if (schema.properties) {
    combSchema.properties = Object.entries(schema.properties)
      .map(([name, propSchema]) => createCombinedSchema(propSchema as JSONSchema6, name, combSchema));
  }

  return combSchema;
}

function setAncestorsVisibility(combSchema: ICombinedSchema, isVisible: boolean) {
  let { parent } = combSchema;
  while (parent) {
    parent.uiSchema['ui:hidden'] = !isVisible;
    parent = parent.parent;
  }
}

/* eslint-disable no-param-reassign */
function filterBySearchterm(combSchema: ICombinedSchema, searchTerm: string) {
  const crawlNode = (node: ICombinedSchema, context: Context<ICombinedSchema>) => {
    // we ignore properties hidden by other means and their children
    if (propertyIsHidden(node.uiSchema)) {
      context.skip();
      return;
    }

    // a node is hidden if it doesn't match the searchTerm and none of its
    // decendents match the searchTerm
    const searchData = node.schema.title || node.propName;
    if (searchData.toLowerCase().includes(searchTerm)) {
      node.uiSchema['ui:hidden'] = false;
      setAncestorsVisibility(node, true);

      // children will not be processed and stay with their individual visibility
      context.skip();
    } else {
      // setting to hidden for now, but may be revised by a child
      node.uiSchema['ui:hidden'] = true;
    }
  };
  crawl(combSchema, crawlNode, {
    getChildren: (node) => node.properties || [],
    order: 'pre',
  });
}
/* eslint-enable no-param-reassign */

const hiddenStyle: React.CSSProperties = {
  display: 'none',
};

function CustomFieldTemplate(props: FieldTemplateProps) {
  const {
    id, classNames, label, help, required, description, errors, children, hidden,
    uiSchema,
  } = props;

  // hidden is set, when 'ui:widget' is set to 'hidden', which renders a HiddenWidget
  // due to performance reasons, we use our own attribute 'ui:hidden' which only hides
  // via CSS and won't replace the react components
  const isHidden = hidden || uiSchema['ui:hidden'];

  return (
    <div className={classNames} style={isHidden ? hiddenStyle : {}}>
      <label htmlFor={id}>
        {label}
        {required ? '*' : null}
      </label>
      {description}
      {children}
      {errors}
      {help}
    </div>
  );
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
    const { focus, onUpdate, propFilter } = props;

    const combSchema = createCombinedSchema(options.schema);

    // merging in the uiSchema
    merge(combSchema.uiSchema, options.uiSchema);

    // missing properties
    const directive = options.missingPropertiesDirective
      || MissingPropertiesDirective.HIDE_AND_IGNORE;
    handleMissingPropertiesUI(options.schema, combSchema.uiSchema, focus, directive);

    // search filter
    if (propFilter) { filterBySearchterm(combSchema, propFilter); }

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
        FieldTemplate={CustomFieldTemplate}
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
