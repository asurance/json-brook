import {
	endNumberTokenCurrent,
	parseNextToken,
	parseNextTokenWithKeyword,
	parseNextTokenWithNumber,
	parseNextTokenWithString,
	type StringTokenCurrent,
	type TokenCurrent,
} from "./tokenize";

export type RootNode = {
	type: "root";
	value: LiteralNode | ArrayNode | ObjectNode | null;
};

export type LiteralNode = {
	type: "literal";
	value: string | number | boolean | null;
	current: TokenCurrent | null;
	parent: RootNode | ArrayNode | PropertyNode;
};

export const ArrayNodeState = {
	Start: 1,
	Value: 2,
	Comma: 3,
	End: 4,
} as const;

export type ArrayNodeState =
	(typeof ArrayNodeState)[keyof typeof ArrayNodeState];

export type ArrayNode = {
	type: "array";
	state: ArrayNodeState;
	children: (LiteralNode | ArrayNode | ObjectNode)[];
	parent: RootNode | ArrayNode | PropertyNode;
};

export type IdentifierNode = {
	type: "identifier";
	value: string;
	current: StringTokenCurrent | null;
	parent: PropertyNode;
};

export const PropertyNodeState = {
	Key: 1,
	Colon: 2,
	Value: 3,
	End: 4,
} as const;

export type PropertyNodeState =
	(typeof PropertyNodeState)[keyof typeof PropertyNodeState];

export type PropertyNode = {
	type: "property";
	state: PropertyNodeState;
	key: IdentifierNode;
	value: LiteralNode | ArrayNode | ObjectNode | null;
	parent: ObjectNode;
};

export const ObjectNodeState = {
	Start: 1,
	Property: 2,
	Comma: 3,
	End: 4,
} as const;

export type ObjectNodeState =
	(typeof ObjectNodeState)[keyof typeof ObjectNodeState];

export type ObjectNode = {
	type: "object";
	state: ObjectNodeState;
	children: PropertyNode[];
	parent: RootNode | ArrayNode | PropertyNode;
};

export type Node =
	| RootNode
	| LiteralNode
	| IdentifierNode
	| PropertyNode
	| ObjectNode
	| ArrayNode;

const onEndToParent = (
	parent: RootNode | ArrayNode | PropertyNode,
	char?: string,
): Node => {
	switch (parent.type) {
		case "root":
			if (char) {
				throw new Error("解析失败");
			}
			return parent;
		case "array":
			if (parent.state === ArrayNodeState.Value) {
				if (!char) {
					return parent;
				}
				return parseArrayNode(parent, char);
			}
			throw new Error("解析失败");
		case "property":
			if (parent.state === PropertyNodeState.Value) {
				parent.state = PropertyNodeState.End;
				return parent.parent;
			}
			throw new Error("解析失败");
	}
};

export const parseRootNode = (node: RootNode, char: string) => {
	if (!node.value) {
		const nextToken = parseNextToken(char);
		if (nextToken.current) {
			node.value = {
				type: "literal",
				value: null,
				current: nextToken.current,
				parent: node,
			};
			return node.value;
		}
		if (!nextToken.token) {
			return node;
		}
		switch (nextToken.token.value) {
			case "[":
				node.value = {
					type: "array",
					state: ArrayNodeState.Start,
					children: [],
					parent: node,
				};
				return node.value;
			case "{":
				node.value = {
					type: "object",
					state: ObjectNodeState.Start,
					children: [],
					parent: node,
				};
				return node.value;
		}
	}
	throw new Error("解析失败");
};

export const parseLiteralNode = (node: LiteralNode, char: string) => {
	if (node.current) {
		switch (node.current.type) {
			case "keyword": {
				const nextToken = parseNextTokenWithKeyword(char, node.current);
				if (nextToken.token) {
					node.value = nextToken.token.value;
					node.current = null;
					return onEndToParent(node.parent);
				} else {
					node.current = nextToken.current;
					return node;
				}
			}
			case "string": {
				const nextToken = parseNextTokenWithString(char, node.current);
				if (nextToken.token) {
					node.value = nextToken.token.value;
					node.current = null;
					return onEndToParent(node.parent);
				} else {
					node.current = nextToken.current;
					return node;
				}
			}
			case "number": {
				const nextToken = parseNextTokenWithNumber(char, node.current);
				if (nextToken.token) {
					node.value = nextToken.token.value;
					node.current = null;
					return onEndToParent(node.parent, nextToken.char);
				} else {
					node.current = nextToken.current;
					return node;
				}
			}
		}
	}
	throw new Error("解析失败");
};

export const parseArrayNode = (node: ArrayNode, char: string) => {
	switch (node.state) {
		case ArrayNodeState.Start: {
			const nextToken = parseNextToken(char);
			if (nextToken.current) {
				node.state = ArrayNodeState.Value;
				const child: LiteralNode = {
					type: "literal",
					value: null,
					current: nextToken.current,
					parent: node,
				};
				node.children.push(child);
				return child;
			}
			if (!nextToken.token) {
				return node;
			}
			switch (nextToken.token.value) {
				case "]":
					node.state = ArrayNodeState.End;
					return onEndToParent(node.parent);
				case "[": {
					node.state = ArrayNodeState.Value;
					const child: ArrayNode = {
						type: "array",
						state: ArrayNodeState.Start,
						children: [],
						parent: node,
					};
					node.children.push(child);
					return child;
				}
				case "{": {
					node.state = ArrayNodeState.Start;
					const child: ObjectNode = {
						type: "object",
						state: ObjectNodeState.Start,
						children: [],
						parent: node,
					};
					node.children.push(child);
					return child;
				}
			}
			throw new Error("解析失败");
		}
		case ArrayNodeState.Comma: {
			const nextToken = parseNextToken(char);
			if (nextToken.current) {
				node.state = ArrayNodeState.Value;
				const child: LiteralNode = {
					type: "literal",
					value: null,
					current: nextToken.current,
					parent: node,
				};
				node.children.push(child);
				return child;
			}
			if (!nextToken.token) {
				return node;
			}
			switch (nextToken.token.value) {
				case "[": {
					node.state = ArrayNodeState.Value;
					const child: ArrayNode = {
						type: "array",
						state: ArrayNodeState.Start,
						children: [],
						parent: node,
					};
					node.children.push(child);
					return child;
				}
				case "{": {
					node.state = ArrayNodeState.Start;
					const child: ObjectNode = {
						type: "object",
						state: ObjectNodeState.Start,
						children: [],
						parent: node,
					};
					node.children.push(child);
					return child;
				}
			}
			throw new Error("解析失败");
		}
		case ArrayNodeState.Value: {
			const nextToken = parseNextToken(char);
			if (nextToken.current) {
				throw new Error("解析失败");
			}
			if (!nextToken.token) {
				return node;
			}
			switch (nextToken.token.value) {
				case ",":
					node.state = ArrayNodeState.Comma;
					return node;
				case "]":
					node.state = ArrayNodeState.End;
					return onEndToParent(node.parent);
			}
			throw new Error("解析失败");
		}
		case ArrayNodeState.End:
			throw new Error("解析失败");
	}
};

export const parseIdentifierNode = (node: IdentifierNode, char: string) => {
	if (node.current) {
		const nextToken = parseNextTokenWithString(char, node.current);
		if (nextToken.current) {
			node.current = nextToken.current;
			return node;
		} else {
			node.value = nextToken.token.value;
			node.current = null;
			node.parent.state = PropertyNodeState.Colon;
			return node.parent;
		}
	}
	throw new Error("解析失败");
};

export const parsePropertyNode = (node: PropertyNode, char: string) => {
	switch (node.state) {
		case PropertyNodeState.Colon: {
			const nextToken = parseNextToken(char);
			if (nextToken.current) {
				throw new Error("解析失败");
			}
			if (!nextToken.token) {
				return node;
			}
			switch (nextToken.token.value) {
				case ":":
					node.state = PropertyNodeState.Value;
					return node;
			}
			throw new Error("解析失败");
		}
		case PropertyNodeState.Value: {
			const nextToken = parseNextToken(char);
			if (nextToken.current) {
				const child: LiteralNode = {
					type: "literal",
					value: null,
					current: nextToken.current,
					parent: node,
				};
				node.value = child;
				return child;
			}
			if (!nextToken.token) {
				return node;
			}
			switch (nextToken.token.value) {
				case "[": {
					const child: ArrayNode = {
						type: "array",
						state: ArrayNodeState.Start,
						children: [],
						parent: node,
					};
					node.value = child;
					return child;
				}
				case "{": {
					const child: ObjectNode = {
						type: "object",
						state: ObjectNodeState.Start,
						children: [],
						parent: node,
					};
					node.value = child;
					return child;
				}
			}
			throw new Error("解析失败");
		}
		case PropertyNodeState.Key:
		case PropertyNodeState.End:
			throw new Error("解析失败");
	}
};

export const parseObjectNode = (node: ObjectNode, char: string) => {
	switch (node.state) {
		case ObjectNodeState.Start: {
			const nextToken = parseNextToken(char);
			if (nextToken.current) {
				if (nextToken.current.type === "string") {
					node.state = ObjectNodeState.Property;
					const child: PropertyNode = {
						type: "property",
						state: PropertyNodeState.Key,
						key: null as unknown as IdentifierNode,
						value: null,
						parent: node,
					};
					const identifier: IdentifierNode = {
						type: "identifier",
						value: "",
						current: nextToken.current,
						parent: child,
					};
					child.key = identifier;
					node.children.push(child);
					return identifier;
				}
				throw new Error("解析失败");
			}
			if (!nextToken.token) {
				return node;
			}
			switch (nextToken.token.value) {
				case "}":
					node.state = ObjectNodeState.End;
					return onEndToParent(node.parent);
			}
			throw new Error("解析失败");
		}
		case ObjectNodeState.Comma: {
			const nextToken = parseNextToken(char);
			if (nextToken.current) {
				if (nextToken.current.type === "string") {
					node.state = ObjectNodeState.Property;
					const child: PropertyNode = {
						type: "property",
						state: PropertyNodeState.Key,
						key: null as unknown as IdentifierNode,
						value: null,
						parent: node,
					};
					const identifier: IdentifierNode = {
						type: "identifier",
						value: "",
						current: nextToken.current,
						parent: child,
					};
					child.key = identifier;
					node.children.push(child);
					return identifier;
				}
				throw new Error("解析失败");
			}
			if (!nextToken.token) {
				return node;
			}
			throw new Error("解析失败");
		}
		case ObjectNodeState.Property: {
			const nextToken = parseNextToken(char);
			if (nextToken.current) {
				throw new Error("解析失败");
			}
			if (!nextToken.token) {
				return node;
			}
			switch (nextToken.token.value) {
				case ",":
					node.state = ObjectNodeState.Comma;
					return node;
				case "}":
					node.state = ObjectNodeState.End;
					return onEndToParent(node.parent);
			}
			throw new Error("解析失败");
		}
		case ObjectNodeState.End:
			throw new Error("解析失败");
	}
};

export const endAst = (current: Node): Node => {
	switch (current.type) {
		case "root":
			return current;
		case "literal":
			if (current.current && current.current.type === "number") {
				const token = endNumberTokenCurrent(current.current);
				current.value = token.value;
				current.current = null;
				return onEndToParent(current.parent);
			}
			throw new Error("解析失败");
		case "array":
		case "object":
		case "property":
		case "identifier":
			throw new Error("解析失败");
	}
};
