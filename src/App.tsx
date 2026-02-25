import { codeToHtml } from "shiki";
import type { Component } from "solid-js";
import { createResource, Show } from "solid-js";

const testJsonCode = JSON.stringify(
	{
		a: 1001,
		b: "hello",
		c: [1, 2, 3],
		d: null,
	},
	null,
	4,
);

// const highlighter = await createHighlighter({
// 	langs: ["json"],
// 	themes: ["vitesse-light"],
// });

const result = await codeToHtml(testJsonCode, {
	lang: "json",
	theme: "vitesse-light",
	decorations: [
		{
			start: 2,
			end: 10,
			properties: {
				class: "bg-red-500",
			},
		},
	],
});

const App: Component = () => {
	const [codeResult] = createResource(async () => {
		return result;
	});
	return (
		<div>
			<header></header>
			<main>
				<div>
					<Show when={codeResult()}>{(c) => <div innerHTML={c()} />}</Show>
				</div>
				<div></div>
				<div></div>
			</main>
		</div>
	);
};

export default App;
