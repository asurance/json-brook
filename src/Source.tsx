import type { HighlighterCore } from "shiki/core";
import { Form } from "solid-bootstrap";
import { createMemo, createSignal } from "solid-js";
import { lang, theme } from "./constant";

export type SourceProps = {
	highlighter: HighlighterCore;
	sourceCode: string;
	parsedLength: number;
};

const Source = (props: SourceProps) => {
	const [getMode, setMode] = createSignal(false);
	const getHtml = createMemo(() => {
		return props.highlighter.codeToHtml(props.sourceCode, {
			lang,
			theme,
			decorations:
				props.parsedLength < props.sourceCode.length
					? [
							{
								start: props.parsedLength,
								end: props.sourceCode.length,
								properties: getMode()
									? {
											class: "!text-gray-500 [&_span]:!text-gray-500",
										}
									: {
											class: "!text-white [&_span]:!text-white",
										},
							},
						]
					: [],
		});
	});
	return (
		<div class="relative flex flex-col gap-2 overflow-hidden h-full bg-white p-2 rounded">
			<div class="text-xl font-bold flex-none">源</div>
			<div class="flex-1 overflow-auto" innerHTML={getHtml()} />
			<div class="absolute top-2 right-2">
				<Form.Check
					type="checkbox"
					checked={getMode()}
					label="展示全部"
					onChange={(e) => {
						setMode(e.target.checked);
					}}
				/>
			</div>
		</div>
	);
};

export default Source;
