/* eslint-disable import/no-unresolved */
// TODO: wait for eslint-plugin-import fix for TS 3.8 import type
import type { INode } from 'babylonjs-gltf2interface';
import type { JSONSchema6 } from 'json-schema';
import type { UiSchema } from 'react-jsonschema-form';
import {
  transformLens, ITransformFocus, DEFAULT_TRANSLATION, DEFAULT_ROTATION, DEFAULT_SCALE,
} from '../../../common/lenses/transformLens';
import type { ILensView } from './LensView';
import { defaultFields } from '../fields/defaultFields';
import { createComponent, MissingPropertiesDirective } from './JSONSchemaFormView';

// interesting alternative to react-jsonschema-forms, but quite new: https://github.com/gravel-form/blueprintjs-form


// The json schema describing the transform datatype
const schema: JSONSchema6 = {
  type: 'object',
  properties: {
    translation: {
      title: 'Translation',
      type: 'array',
      items: { type: 'number' },
      default: DEFAULT_TRANSLATION,
    },
    rotation: {
      title: 'Rotation',
      type: 'array',
      items: { type: 'number' },
      default: DEFAULT_ROTATION,
    },
    scale: {
      title: 'Scale',
      type: 'array',
      items: { type: 'number' },
      default: DEFAULT_SCALE,
    },
  },
};

// UISchema for setting special ui options
const uiSchema: UiSchema = {
  translation: { 'ui:field': 'Vector3' },
  rotation: { 'ui:field': 'Quaternion' },
  scale: { 'ui:field': 'Vector3' },
};

const options = {
  displayName: 'TransformView',
  schema,
  uiSchema,
  fields: defaultFields,
  missingPropertiesDirective: MissingPropertiesDirective.SHOW_AND_IGNORE,
};
const TransformView = createComponent<ITransformFocus>(options);

export const transformView: ILensView<INode, ITransformFocus> = {
  name: 'Transform',
  lens: transformLens,
  component: TransformView,
  isRelevant: () => true,
};
