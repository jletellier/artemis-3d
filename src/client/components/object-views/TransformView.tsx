/* eslint-disable import/no-unresolved */
// TODO: wait for eslint-plugin-import fix for TS 3.8 import type
import type { INode } from 'babylonjs-gltf2interface';
import type { JSONSchema6 } from 'json-schema';
import type { UiSchema } from 'react-jsonschema-form';
import { transformLens, ITransformFocus } from '../../../common/lenses/transformLens';
import type { ILensView } from './LensView';
import { defaultFields } from '../fields/defaultFields';
import { createComponent } from './JSONSchemaFormView';

// interesting alternative to react-jsonschema-forms, but quite new: https://github.com/gravel-form/blueprintjs-form


// The json schema describing the transform datatype
const schema: JSONSchema6 = {
  type: 'object',
  properties: {
    translation: {
      title: 'Translation',
      type: 'array',
      items: { type: 'number' },
    },
    rotation: {
      title: 'Rotation',
      type: 'array',
      items: { type: 'number' },
    },
  },
};

// UISchema for setting special ui options
const uiSchema: UiSchema = {
  translation: { 'ui:field': 'Vector3' },
  rotation: { 'ui:field': 'Quaternion' },
};

const TransformView = createComponent<ITransformFocus>('TransformView', schema, uiSchema, defaultFields);

export const transformView: ILensView<INode, ITransformFocus> = {
  name: 'Transform',
  lens: transformLens,
  component: TransformView,
  isRelevant: (node: INode) => 'translation' in node || 'rotation' in node,
};
