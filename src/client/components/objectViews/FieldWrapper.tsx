import React from 'react';
import { FieldTemplateProps } from 'react-jsonschema-form';

// TODO: use hiding functionalty of theme framework
const hiddenStyle: React.CSSProperties = {
  display: 'none',
};

export function FieldWrapper(props: FieldTemplateProps) {
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
