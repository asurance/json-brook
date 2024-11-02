import type { Token } from './create-tokenize';

export type RootNode = {
  type: 'Root';
  current: ObjectNode | ArrayNode | LiteralNode | null;
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
  current: LiteralNode | ArrayNode | ObjectNode | null;
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
    current: null,
  };
  let currentRef: RootNode | ArrayNode | PropertyNode | ObjectNode = root;
  const tryGetNextValue = (
    token: Token,
  ): LiteralNode | ArrayNode | ObjectNode | null => {
    if (token.type === 'Keyword') {
      return {
        type: 'Literal',
        value: token.value,
      };
    }
    if (token.type === 'String') {
      return {
        type: 'Literal',
        value: token.value,
      };
    }
    if (token.type === 'Number') {
      return {
        type: 'Literal',
        value: token.value,
      };
    }
    if (token.type === 'Symbol' && token.value === '[') {
      return {
        type: 'Array',
        children: [],
        state: ArrayNodeState.Start,
        parent: currentRef as RootNode | ArrayNode | PropertyNode,
        current: null,
      };
    }
    if (token.type === 'Symbol' && token.value === '{') {
      return {
        type: 'Object',
        children: [],
        state: ObjectNodeState.Start,
        parent: currentRef as RootNode | ArrayNode | PropertyNode,
        current: null,
      };
    }
    return null;
  };
  const onArrayOrObjectFinish = () => {
    currentRef = currentRef as ObjectNode | ArrayNode;
    switch (currentRef.parent.type) {
      case 'Root':
        return;
      case 'Array':
        currentRef.parent.children.push(currentRef);
        currentRef.parent.current = null;
        currentRef = currentRef.parent;
        return;
      case 'Property':
        currentRef.parent.current = currentRef;
        currentRef = currentRef.parent;
        currentRef.parent.children.push(currentRef);
        currentRef.parent.current = null;
        currentRef = currentRef.parent;
        return;
    }
  };
  const onPropertyFinish = () => {
    currentRef = currentRef as PropertyNode;
    currentRef.parent.children.push(currentRef);
    currentRef.parent.current = null;
    currentRef = currentRef.parent;
  };
  const getRoot = (): LiteralNode | ArrayNode | ObjectNode | null =>
    root.current;
  const write = (token: Token) => {
    switch (currentRef.type) {
      case 'Root':
        if (currentRef.current === null) {
          const next = tryGetNextValue(token);
          if (next) {
            currentRef.current = next;
            if (next.type !== 'Literal') {
              currentRef = next;
            }
            return;
          }
        }
        throw new Error('解析错误');
      case 'Array':
        switch (currentRef.state) {
          case ArrayNodeState.Start: {
            if (token.type === 'Symbol' && token.value === ']') {
              onArrayOrObjectFinish();
              return;
            }
            const next = tryGetNextValue(token);
            if (next) {
              currentRef.state = ArrayNodeState.Value;
              if (next.type === 'Literal') {
                currentRef.children.push(next);
                currentRef.current = null;
              } else {
                currentRef.current = next;
                currentRef = next;
              }
              return;
            }
            throw new Error('解析错误');
          }
          case ArrayNodeState.Value:
            if (token.type === 'Symbol' && token.value === ']') {
              onArrayOrObjectFinish();
              return;
            }
            if (token.type === 'Symbol' && token.value === ',') {
              currentRef.state = ArrayNodeState.Comma;
              return;
            }
            throw new Error('解析错误');
          case ArrayNodeState.Comma: {
            const next = tryGetNextValue(token);
            if (next) {
              currentRef.state = ArrayNodeState.Value;
              if (next.type === 'Literal') {
                currentRef.children.push(next);
                currentRef.current = null;
              } else {
                currentRef.current = next;
                currentRef = next;
              }
              return;
            }
            throw new Error('解析错误');
          }
        }
      case 'Property':
        switch (currentRef.state) {
          case PropertyNodeState.Key:
            if (token.type === 'Symbol' && token.value === ':') {
              currentRef.state = PropertyNodeState.Colon;
              return;
            }
            throw new Error('解析错误');
          case PropertyNodeState.Colon: {
            const next = tryGetNextValue(token);
            if (next) {
              currentRef.state = PropertyNodeState.Value;
              currentRef.current = next;
              if (next.type === 'Literal') {
                onPropertyFinish();
              } else {
                currentRef = next;
              }
              return;
            }
            throw new Error('解析错误');
          }
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
                current: null,
                state: PropertyNodeState.Key,
                parent: currentRef,
              };
              currentRef = currentRef.current;
              return;
            }
            if (token.type === 'Symbol' && token.value === '}') {
              onArrayOrObjectFinish();
              return;
            }
            throw new Error('解析错误');
          case ObjectNodeState.Property:
            if (token.type === 'Symbol' && token.value === '}') {
              onArrayOrObjectFinish();
              return;
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
                current: null,
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
