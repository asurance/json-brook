import ChevronRight from "lucide-solid/icons/chevron-right";
import Plus from "lucide-solid/icons/plus";
import RotateCcw from "lucide-solid/icons/rotate-ccw";
import { createHighlighter } from "shiki";
import { Alert, Button, ProgressBar } from "solid-bootstrap";
import type { Component } from "solid-js";
import { createEffect, createResource, createSignal, Show } from "solid-js";
import { createJsonBrook } from "../lib";
import Ast from "./Ast";
import CreateModal from "./CreateModal";
import { lang, theme } from "./constant";
import Result from "./Result";
import Source from "./Source";

const initJsonCode = JSON.stringify(
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
	const [getTestCode, setTestCode] = createSignal(initJsonCode);
	const [getJsonBrook, setJsonBrook] = createSignal(createJsonBrook());
	const [getParsedLength, setParsedLength] = createSignal(0);
	const [getHasError, setHasError] = createSignal(false);
	const [getCreateModalShow, setCreateModalShow] = createSignal(false);
	const onNext = () => {
		try {
			getJsonBrook().parse(getTestCode()[getParsedLength()]);
			setParsedLength((val) => val + 1);
		} catch (e) {
			console.error(e);
			setHasError(true);
		}
	};
	createEffect(() => {
		const controller = new AbortController();
		window.addEventListener(
			"keydown",
			(e) => {
				if (getHasError() || getParsedLength() === getTestCode().length) {
					return;
				}
				if (e.key === "ArrowRight") {
					onNext();
				}
			},
			{
				signal: controller.signal,
			},
		);
		return () => {
			controller.abort();
		};
	});
	return (
		<main class="h-screen flex flex-col gap-2 p-2 bg-blue-300">
			<div class="flex-none flex gap-2 items-center bg-white rounded p-2">
				<Button onClick={() => setCreateModalShow(true)}>
					<div class="inline-flex gap-2 items-center">
						<Plus size={16} /> 新示例
					</div>
				</Button>
			</div>
			<Show when={getHasError()}>
				<Alert variant="danger" class="mb-0!">
					解析失败，请重置或使用新示例
				</Alert>
			</Show>
			<div class="flex-1 overflow-hidden grid grid-cols-3 gap-2">
				<Show when={getHighlighter()}>
					{(getHighlighter) => (
						<>
							<Source
								highlighter={getHighlighter()}
								sourceCode={getTestCode()}
								parsedLength={getParsedLength()}
							/>
							<Ast
								highlighter={getHighlighter()}
								jsonBrook={getJsonBrook()}
								parsedLength={getParsedLength()}
							/>
							<Result
								highlighter={getHighlighter()}
								jsonBrook={getJsonBrook()}
								parsedLength={getParsedLength()}
							/>
						</>
					)}
				</Show>
			</div>
			<div class="flex-none flex gap-2 items-center bg-white rounded p-2">
				<Button
					onClick={() => {
						setJsonBrook(createJsonBrook());
						setParsedLength(0);
						setHasError(false);
					}}
				>
					<div class="inline-flex gap-2 items-center">
						<RotateCcw size={16} /> 重置
					</div>
				</Button>
				<Button
					disabled={getParsedLength() === getTestCode().length || getHasError()}
					onClick={onNext}
				>
					<div class="inline-flex gap-2 items-center">
						<ChevronRight size={16} />
						下一步
					</div>
				</Button>
				{`${getParsedLength()}/${getTestCode().length}`}
				<div class="flex-1">
					<ProgressBar now={getParsedLength()} max={getTestCode().length} />
				</div>
			</div>
			<CreateModal
				show={getCreateModalShow()}
				onCancel={() => {
					setCreateModalShow(false);
				}}
				onOk={(result) => {
					setCreateModalShow(false);
					setHasError(false);
					setJsonBrook(createJsonBrook());
					setParsedLength(0);
					setTestCode(result);
				}}
			/>
		</main>
	);
};

export default App;
