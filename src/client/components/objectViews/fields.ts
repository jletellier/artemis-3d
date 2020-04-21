import crawl, { Context } from 'tree-crawl';
import { ICombinedSchema } from './CombinedSchema';

export function setFieldVisibility(schema: ICombinedSchema, isVisible: boolean) {
  // eslint-disable-next-line no-param-reassign
  schema.uiSchema['ui:hidden'] = !isVisible;
}

export function isFieldVisible(schema: ICombinedSchema) {
  return schema.uiSchema['ui:widget'] !== 'hidden' && schema.uiSchema['ui:hidden'] !== true;
}

export function setFieldEnabled(schema: ICombinedSchema, isEnabled: boolean) {
  // eslint-disable-next-line no-param-reassign
  schema.uiSchema['ui:disabled'] = !isEnabled;
}

export function isFieldEnabled(schema: ICombinedSchema) {
  return !schema.uiSchema['ui:disabled'];
}

export function setAncestorsVisibility(combSchema: ICombinedSchema, isVisible: boolean) {
  let { parent } = combSchema;
  while (parent) {
    setFieldVisibility(parent, isVisible);
    parent = parent.parent;
  }
}

export function hideBySearchterm(combSchema: ICombinedSchema, searchTerm: string) {
  const crawlNode = (node: ICombinedSchema, context: Context<ICombinedSchema>) => {
    // we ignore fields hidden by other means and their children
    if (!isFieldVisible(node)) {
      context.skip();
      return;
    }

    // a field is hidden if it doesn't match the searchTerm and none of its
    // decendents match the searchTerm
    const searchData = node.schema.title || node.propName;
    if (searchData.toLowerCase().includes(searchTerm)) {
      setFieldVisibility(node, true);
      setAncestorsVisibility(node, true);

      // children will not be processed and stay with their individual visibility
      context.skip();
    } else {
      // hiding for now, but may be revised by a child
      setFieldVisibility(node, false);
    }
  };
  crawl(combSchema, crawlNode, {
    getChildren: (node) => node.properties || [],
    order: 'pre',
  });
}
