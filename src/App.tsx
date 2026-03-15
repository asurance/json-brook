import { createHighlighter } from "shiki";
import { Button, ProgressBar } from "solid-bootstrap";
import type { Component } from "solid-js";
import { createResource, createSignal, Show } from "solid-js";
import { createJsonBrook } from "../lib";
import Ast from "./Ast";
import { lang, theme } from "./constant";
import Result from "./Result";
import Source from "./Source";

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

const highlighterPromise = await createHighlighter({
	langs: [lang],
	themes: [theme],
});

const App: Component = () => {
	const [getHighlighter] = createResource(() => {
		return highlighterPromise;
	});
	const jsonBrook = createJsonBrook();
	const [getParsedLength, setParsedLength] = createSignal(0);

	return (
		<main>
			<div class="grid grid-cols-3">
				<Show when={getHighlighter()}>
					{(getHighlighter) => (
						<>
							<div>
								<Source
									highlighter={getHighlighter()}
									sourceCode={testJsonCode}
									parsedLength={getParsedLength()}
								/>
							</div>
							<div>
								<Ast
									highlighter={getHighlighter()}
									jsonBrook={jsonBrook}
									parsedLength={getParsedLength()}
								/>
							</div>
							<div>
								<Result
									highlighter={getHighlighter()}
									jsonBrook={jsonBrook}
									parsedLength={getParsedLength()}
								/>
							</div>
						</>
					)}
				</Show>
			</div>
			<div>
				<Button
					disabled={getParsedLength() === testJsonCode.length}
					onClick={() => {
						try {
							jsonBrook.parse(testJsonCode[getParsedLength()]);
						} catch (e) {
							console.error(e);
						}
						setParsedLength((val) => val + 1);
					}}
				>
					parse next
				</Button>
				{`${getParsedLength()}/${testJsonCode.length}`}
				<ProgressBar now={getParsedLength()} max={testJsonCode.length} />
			</div>
		</main>
	);
};

export default App;
