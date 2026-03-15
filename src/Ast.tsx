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
	return (
		<div class="overflow-hidden h-full bg-white p-2 rounded flex flex-col gap-2">
			<div class="text-xl font-bold flex-none">AST</div>
			<div class="flex-1 overflow-auto" innerHTML={getHtml()} />
		</div>
	);
};

export default Ast;
