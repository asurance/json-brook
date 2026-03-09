import type { HighlighterCore } from "shiki/core";
import { createMemo } from "solid-js";
import { lang, theme } from "./constant";

export type SourceProps = {
	highlighter: HighlighterCore;
	sourceCode: string;
	parsedLength: number;
};

const Source = (props: SourceProps) => {
	const getHtml = createMemo(() => {
		return props.highlighter.codeToHtml(props.sourceCode, {
			lang,
			theme,
			decorations: [
				{
					start: props.parsedLength,
					end: props.sourceCode.length,
					properties: {
						class: "!text-gray-400 [&_span]:!text-gray-500 bg-gray-100",
					},
				},
			],
		});
	});
	return <div innerHTML={getHtml()} />;
};

export default Source;
