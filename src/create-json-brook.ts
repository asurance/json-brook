import createParser, {
  type ArrayNode,
  type LiteralNode,
  type ObjectNode,
} from './create-parser';
import createTokenize from './create-tokenize';

// biome-ignore lint/suspicious/noExplicitAny: 可以返回的类型不确定
function getValueFromNode(node: LiteralNode | ArrayNode | ObjectNode): any {
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'Array':
      return (
        node.current ? [...node.children, node.current] : node.children
      ).map(child => getValueFromNode(child));
    case 'Object':
      return (
        node.current ? [...node.children, node.current] : node.children
      ).reduce(
        (obj, property) => {
          if (property.value) {
            obj[property.key.value] = getValueFromNode(property.value);
          }
          return obj;
        },
        // biome-ignore lint/suspicious/noExplicitAny: 可以返回的类型不确定
        {} as Record<string, any>,
      );
  }
}
export default function createJsonBrook() {
  const tokenize = createTokenize();
  const parser = createParser();
  const write = (str: string) => {
    for (const char of str) {
      const token = tokenize.write(char);
      if (token) {
        if (Array.isArray(token)) {
          for (const t of token) {
            parser.write(t);
          }
        } else {
          parser.write(token);
        }
      }
    }
  };
  const end = () => {
    const token = tokenize.end();
    if (token) {
      parser.write(token);
    }
  };
  const getCurrent = () => {
    const root = parser.getRoot();
    if (root) {
      return getValueFromNode(root);
    } else {
      return void 0;
    }
  };
  return {
    getCurrent,
    write,
    end,
  };
}
