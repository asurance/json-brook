import type { HighlighterCore } from "shiki";
import type { JsonBrook } from "../lib";
import { lang, theme } from "./constant";

export type AstProps = {
	highlighter: HighlighterCore;
	jsonBrook: JsonBrook;
	parsedLength: number;
};

const Ast = (props: AstProps) => {
	const getHtml = () => {
		props.parsedLength;
		const root = JSON.stringify(
			props.jsonBrook.getRoot(),
			(key, val) => (key === "parent" ? void 0 : val),
			4,
		);
		return props.highlighter.codeToHtml(root, { lang, theme });
	};
	return <div innerHTML={getHtml()} />;
};

export default Ast;
