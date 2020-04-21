import { JSONSchema6 } from 'json-schema';
import { UiSchema } from 'react-jsonschema-form';

// TODO: filename - here is an interface and a factory function. Can this be PascalCase?

export interface ICombinedSchema {
  propName: string;
  schema: JSONSchema6;
  uiSchema: UiSchema;
  properties?: ICombinedSchema[];
  parent: ICombinedSchema;
}

export function createCombinedSchema(schema: JSONSchema6, propName: string = '', parent: ICombinedSchema = null): ICombinedSchema {
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
