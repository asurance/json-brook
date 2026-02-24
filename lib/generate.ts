import type {
	ArrayNode,
	JsonBrook,
	LiteralNode,
	ObjectNode,
	RootNode,
} from ".";

const literalGenerator = (node: LiteralNode) => {
	if (node.current) {
		switch (node.current.type) {
			case "keyword":
				return node.current.value;
			case "string":
				return JSON.parse(
					node.current.escapeLength > 0
						? node.current.value.slice(0, -node.current.escapeLength)
						: node.current.value,
				);
			case "number":
				return JSON.parse(
					node.current.value.slice(0, node.current.validLength),
				);
		}
	}
	return node.value;
};

const arrayGenerator = (node: ArrayNode) => {
	return node.children.map((child) => {
		return normalGenerator(child);
	});
};

const objectGenerator = (node: ObjectNode) => {
	return node.children.reduce(
		(prev, child) => {
			if (child.value) {
				prev[child.key.value] = normalGenerator(child.value);
			}
			return prev;
		},
		{} as Record<string, unknown>,
	);
};

const normalGenerator = (
	node: LiteralNode | ArrayNode | ObjectNode,
): unknown => {
	switch (node.type) {
		case "literal":
			return literalGenerator(node);
		case "array":
			return arrayGenerator(node);
		case "object":
			return objectGenerator(node);
	}
};

const rootGenerator = (node: RootNode) => {
	if (node.value) {
		return normalGenerator(node.value);
	}
	return void 0;
};

export const simpleGenerator = (brook: JsonBrook) => {
	return rootGenerator(brook.getRoot());
};
