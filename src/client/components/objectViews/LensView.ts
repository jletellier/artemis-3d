import type { ComponentType } from 'react';
import type { ILens } from '../../../common/lenses/lenses';

// TODO: maybe use a bound lens instead of focus and onUpdate
export interface ILensViewProps<TFocus> {
  focus: TFocus;
  onUpdate: (focus: TFocus) => void;
  propFilter?: string;
}

export interface ILensView<TObject, TFocus> {
  name: string;
  lens: ILens<TObject, TFocus>;
  component: ComponentType<ILensViewProps<TFocus>>;
  isRelevant: (object: TObject) => boolean;
}
