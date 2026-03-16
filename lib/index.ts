import * as generate from "./generate";
import * as parse from "./parse";
import * as tokenize from "./tokenize";

export type * from "./generate";
export type * from "./parse";
export type * from "./tokenize";

export { generate, parse, tokenize };

export type JsonBrook = ReturnType<typeof createJsonBrook>;

export const createJsonBrook = () => {
	const root: parse.RootNode = {
		type: "root",
		value: null,
	};
	let current: parse.Node = root;
	return {
		getRoot: () => root,
		getCurrent: () => current,
		generate: () => generate.rootGenerator(root),
		parse: (char: string) => {
			switch (current.type) {
				case "root":
					current = parse.parseRootNode(current, char);
					break;
				case "literal":
					current = parse.parseLiteralNode(current, char);
					break;
				case "array":
					current = parse.parseArrayNode(current, char);
					break;
				case "identifier":
					current = parse.parseIdentifierNode(current, char);
					break;
				case "property":
					current = parse.parsePropertyNode(current, char);
					break;
				case "object":
					current = parse.parseObjectNode(current, char);
					break;
			}
		},
		end: () => {
			parse.endAst(current);
		},
	};
};
