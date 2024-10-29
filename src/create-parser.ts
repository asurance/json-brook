import type { Token } from './create-tokenize';

export type RootNode = {
  type: 'Root';
  value: ObjectNode | ArrayNode | LiteralNode | null;
};

export type LiteralNode = {
  type: 'Literal';
  value: string | number | boolean | null;
};

export enum ArrayNodeState {
  Start = 0,
  Value = 1,
  Comma = 2,
}

export type ArrayNode = {
  type: 'Array';
  children: (LiteralNode | ArrayNode | ObjectNode)[];
  state: ArrayNodeState;
  parent: RootNode | ArrayNode | PropertyNode;
  current: ArrayNode | ObjectNode | null;
};

export type IdentifierNode = {
  type: 'Identifier';
  value: string;
};

export enum PropertyNodeState {
  Key = 0,
  Colon = 1,
  Value = 2,
}

export type PropertyNode = {
  type: 'Property';
  key: IdentifierNode;
  value: LiteralNode | ArrayNode | ObjectNode | null;
  state: PropertyNodeState;
  parent: ObjectNode;
};

export enum ObjectNodeState {
  Start = 0,
  Property = 1,
  Comma = 2,
}

export type ObjectNode = {
  type: 'Object';
  children: PropertyNode[];
  state: ObjectNodeState;
  parent: RootNode | ArrayNode | PropertyNode;
  current: PropertyNode | null;
};

export default function createParser() {
  const root: RootNode = {
    type: 'Root',
    value: null,
  };
  let currentRef: RootNode | ArrayNode | PropertyNode | ObjectNode = root;
  const getRoot = (): LiteralNode | ArrayNode | ObjectNode | null => root.value;
  const write = (token: Token) => {
    switch (currentRef.type) {
      case 'Root':
        if (currentRef.value === null) {
          if (token.type === 'Keyword') {
            currentRef.value = {
              type: 'Literal',
              value: token.value,
            };
            return;
          }
          if (token.type === 'String') {
            currentRef.value = {
              type: 'Literal',
              value: token.value,
            };
            return;
          }
          if (token.type === 'Number') {
            currentRef.value = {
              type: 'Literal',
              value: token.value,
            };
            return;
          }
          if (token.type === 'Symbol' && token.value === '[') {
            currentRef.value = {
              type: 'Array',
              children: [],
              state: ArrayNodeState.Start,
              parent: currentRef,
              current: null,
            };
            currentRef = currentRef.value;
            return;
          }
          if (token.type === 'Symbol' && token.value === '{') {
            currentRef.value = {
              type: 'Object',
              children: [],
              state: ObjectNodeState.Start,
              parent: currentRef,
              current: null,
            };
            currentRef = currentRef.value;
            return;
          }
        }
        throw new Error('解析错误');
      case 'Array':
        switch (currentRef.state) {
          case ArrayNodeState.Start:
            if (token.type === 'Symbol' && token.value === ']') {
              switch (currentRef.parent.type) {
                case 'Root':
                  return;
                case 'Array':
                  currentRef.parent.children.push(currentRef);
                  currentRef.parent.current = null;
                  currentRef = currentRef.parent;
                  return;
                case 'Property':
                  currentRef.parent.value = currentRef;
                  currentRef = currentRef.parent;
                  currentRef.parent.children.push(currentRef);
                  currentRef.parent.current = null;
                  currentRef = currentRef.parent;
                  return;
              }
            }
            if (token.type === 'Keyword') {
              currentRef.state = ArrayNodeState.Value;
              currentRef.children.push({
                type: 'Literal',
                value: token.value,
              });
              return;
            }
            if (token.type === 'String') {
              currentRef.state = ArrayNodeState.Value;
              currentRef.children.push({
                type: 'Literal',
                value: token.value,
              });
              return;
            }
            if (token.type === 'Number') {
              currentRef.state = ArrayNodeState.Value;
              currentRef.children.push({
                type: 'Literal',
                value: token.value,
              });
              return;
            }
            if (token.type === 'Symbol' && token.value === '[') {
              currentRef.state = ArrayNodeState.Value;
              currentRef.current = {
                type: 'Array',
                children: [],
                state: ArrayNodeState.Start,
                parent: currentRef,
                current: null,
              };
              currentRef = currentRef.current;
              return;
            }
            if (token.type === 'Symbol' && token.value === '{') {
              currentRef.state = ArrayNodeState.Value;
              currentRef.current = {
                type: 'Object',
                children: [],
                state: ObjectNodeState.Start,
                parent: currentRef,
                current: null,
              };
              return;
            }
            throw new Error('解析错误');
          case ArrayNodeState.Value:
            if (token.type === 'Symbol' && token.value === ']') {
              switch (currentRef.parent.type) {
                case 'Root':
                  return;
                case 'Array':
                  currentRef.parent.children.push(currentRef);
                  currentRef.parent.current = null;
                  currentRef = currentRef.parent;
                  return;
                case 'Property':
                  currentRef.parent.value = currentRef;
                  currentRef = currentRef.parent;
                  currentRef.parent.children.push(currentRef);
                  currentRef.parent.current = null;
                  currentRef = currentRef.parent;
                  return;
              }
            }
            if (token.type === 'Symbol' && token.value === ',') {
              currentRef.state = ArrayNodeState.Comma;
              return;
            }
            throw new Error('解析错误');
          case ArrayNodeState.Comma:
            if (token.type === 'Keyword') {
              currentRef.state = ArrayNodeState.Value;
              currentRef.children.push({
                type: 'Literal',
                value: token.value,
              });
              return;
            }
            if (token.type === 'String') {
              currentRef.state = ArrayNodeState.Value;
              currentRef.children.push({
                type: 'Literal',
                value: token.value,
              });
              return;
            }
            if (token.type === 'Number') {
              currentRef.state = ArrayNodeState.Value;
              currentRef.children.push({
                type: 'Literal',
                value: token.value,
              });
              return;
            }
            if (token.type === 'Symbol' && token.value === '[') {
              currentRef.state = ArrayNodeState.Value;
              currentRef.current = {
                type: 'Array',
                children: [],
                state: ArrayNodeState.Start,
                parent: currentRef,
                current: null,
              };
              currentRef = currentRef.current;
              return;
            }
            if (token.type === 'Symbol' && token.value === '{') {
              currentRef.state = ArrayNodeState.Value;
              currentRef.current = {
                type: 'Object',
                children: [],
                state: ObjectNodeState.Start,
                parent: currentRef,
                current: null,
              };
              return;
            }
            throw new Error('解析错误');
        }
      case 'Property':
        switch (currentRef.state) {
          case PropertyNodeState.Key:
            if (token.type === 'Symbol' && token.value === ':') {
              currentRef.state = PropertyNodeState.Colon;
              return;
            }
            throw new Error('解析错误');
          case PropertyNodeState.Colon:
            if (token.type === 'Keyword') {
              currentRef.state = PropertyNodeState.Value;
              currentRef.value = {
                type: 'Literal',
                value: token.value,
              };
              currentRef.parent.children.push(currentRef);
              currentRef.parent.current = null;
              currentRef = currentRef.parent;
              return;
            }
            if (token.type === 'String') {
              currentRef.state = PropertyNodeState.Value;
              currentRef.value = {
                type: 'Literal',
                value: token.value,
              };
              currentRef.parent.children.push(currentRef);
              currentRef.parent.current = null;
              currentRef = currentRef.parent;
              return;
            }
            if (token.type === 'Number') {
              currentRef.state = PropertyNodeState.Value;
              currentRef.value = {
                type: 'Literal',
                value: token.value,
              };
              currentRef.parent.children.push(currentRef);
              currentRef.parent.current = null;
              currentRef = currentRef.parent;
              return;
            }
            if (token.type === 'Symbol' && token.value === '[') {
              currentRef.state = PropertyNodeState.Value;
              currentRef.value = {
                type: 'Array',
                children: [],
                state: ArrayNodeState.Start,
                parent: currentRef,
                current: null,
              };
              currentRef = currentRef.value;
              return;
            }
            if (token.type === 'Symbol' && token.value === '{') {
              currentRef.state = PropertyNodeState.Value;
              currentRef.value = {
                type: 'Object',
                children: [],
                state: ObjectNodeState.Start,
                parent: currentRef,
                current: null,
              };
              currentRef = currentRef.value;
              return;
            }
            throw new Error('解析错误');
        }
      case 'Object':
        switch (currentRef.state) {
          case ObjectNodeState.Start:
            if (token.type === 'String') {
              currentRef.state = ObjectNodeState.Property;
              currentRef.current = {
                type: 'Property',
                key: {
                  type: 'Identifier',
                  value: token.value,
                },
                value: null,
                state: PropertyNodeState.Key,
                parent: currentRef,
              };
              currentRef = currentRef.current;
              return;
            }
            if (token.type === 'Symbol' && token.value === '}') {
              switch (currentRef.parent.type) {
                case 'Root':
                  return;
                case 'Array':
                  currentRef.parent.children.push(currentRef);
                  currentRef.parent.current = null;
                  currentRef = currentRef.parent;
                  return;
                case 'Property':
                  currentRef.parent.value = currentRef;
                  currentRef = currentRef.parent;
                  currentRef.parent.children.push(currentRef);
                  currentRef.parent.current = null;
                  currentRef = currentRef.parent;
                  return;
              }
            }
            throw new Error('解析错误');
          case ObjectNodeState.Property:
            if (token.type === 'Symbol' && token.value === '}') {
              switch (currentRef.parent.type) {
                case 'Root':
                  return;
                case 'Array':
                  currentRef.parent.children.push(currentRef);
                  currentRef.parent.current = null;
                  currentRef = currentRef.parent;
                  return;
                case 'Property':
                  currentRef.parent.value = currentRef;
                  currentRef = currentRef.parent;
                  currentRef.parent.children.push(currentRef);
                  currentRef.parent.current = null;
                  currentRef = currentRef.parent;
                  return;
              }
            }
            if (token.type === 'Symbol' && token.value === ',') {
              currentRef.state = ObjectNodeState.Comma;
              return;
            }
            throw new Error('解析错误');
          case ObjectNodeState.Comma:
            if (token.type === 'String') {
              currentRef.state = ObjectNodeState.Property;
              currentRef.current = {
                type: 'Property',
                key: {
                  type: 'Identifier',
                  value: token.value,
                },
                value: null,
                state: PropertyNodeState.Key,
                parent: currentRef,
              };
              currentRef = currentRef.current;
              return;
            }
            throw new Error('解析错误');
        }
    }
  };
  return {
    getRoot,
    write,
  };
}
