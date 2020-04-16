export interface ILens<TObject, TFocus> {
  get: (obj: TObject) => TFocus;
  set: (obj: TObject, focus: TFocus) => void;
}

export interface IBoundLens<TFocus> {
  get: () => TFocus;
  set: (focus: TFocus) => void;
}

export function bindLens<TObject, TFocus>(object: TObject,
  lens: ILens<TObject, TFocus>): IBoundLens<TFocus> {
  return {
    get: lens.get.bind(null, object),
    set: lens.set.bind(null, object),
  };
}
