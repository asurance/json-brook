import type { HighlighterCore } from "shiki";
import { createMemo, Show } from "solid-js";
import type { JsonBrook } from "../lib";
import { lang, theme } from "./constant";

export type ResultProps = {
	highlighter: HighlighterCore;
	jsonBrook: JsonBrook;
	parsedLength: number;
};

const Result = (props: ResultProps) => {
	const getHtml = createMemo(() => {
		props.parsedLength;
		const code = JSON.stringify(props.jsonBrook.generate(), null, 4);
		if (!code) {
			return "";
		}
		return props.highlighter.codeToHtml(code, { lang, theme });
	});
	return (
		<div class="flex flex-col gap-2 overflow-hidden h-full bg-white p-2 rounded">
			<div class="text-xl font-bold flex-none">解析值</div>
			<Show when={getHtml()}>
				<div class="flex-1 overflow-auto" innerHTML={getHtml()} />
			</Show>
		</div>
	);
};

export default Result;
