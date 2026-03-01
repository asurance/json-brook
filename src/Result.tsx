import type { HighlighterCore } from "shiki";
import { ShikiMagicMove } from "shiki-magic-move/solid";
import { createMemo, Show } from "solid-js";
import type { JsonBrook } from "../lib";
import { generate } from "../lib";
import { lang, theme } from "./constant";

export type ResultProps = {
	highlighter: HighlighterCore;
	jsonBrook: JsonBrook;
	parsedLength: number;
};

const Result = (props: ResultProps) => {
	const getCode = createMemo(() => {
		props.parsedLength;
		return JSON.stringify(generate.simpleGenerator(props.jsonBrook), null, 4);
	});
	return (
		<Show when={getCode()}>
			<ShikiMagicMove
				highlighter={props.highlighter}
				lang={lang}
				theme={theme}
				code={getCode()}
			/>
		</Show>
	);
};

export default Result;
