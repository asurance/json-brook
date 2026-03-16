import { describe, expect, test } from "vitest";
import { createJsonBrook } from "../lib";

const useJsonBrook = (str: string) => {
	const jsonBrook = createJsonBrook();
	for (const char of str) {
		jsonBrook.parse(char);
	}
	jsonBrook.end();
	return jsonBrook;
};

test("默认", () => {
	const json = {
		a: 1001,
		b: "hello",
		c: [1, 2, 3],
		d: null,
	};
	const jsonCode = JSON.stringify(json, null, 4);
	const jsonBrook = useJsonBrook(jsonCode);
	expect(jsonBrook.generate()).toStrictEqual(json);
});

describe("关键词", () => {
	for (const keyword of [true, false, null]) {
		test(`${keyword}`, () => {
			const jsonCode = JSON.stringify(keyword);
			const jsonBrook = useJsonBrook(jsonCode);
			expect(jsonBrook.generate()).toStrictEqual(keyword);
		});
	}
});

describe("字符串", () => {
	test("hello world!", () => {
		const jsonCode = JSON.stringify("hello world!");
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual("hello world!");
	});
	test("空字符串", () => {
		const jsonCode = JSON.stringify("");
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual("");
	});
	test("包含转义字符的字符串", () => {
		const jsonCode = JSON.stringify("hello\nworld!");
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual("hello\nworld!");
	});
	test("包含特殊字符的字符串", () => {
		const jsonCode = JSON.stringify('hello"world!');
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual('hello"world!');
	});
	test("包含unicode字符的字符串", () => {
		const jsonCode = JSON.stringify("hello\u0a20world!");
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual("hello\u0a20world!");
	});
	test("不完整的字符串", () => {
		expect(() => {
			const jsonCode = `"Hello`;
			const jsonBrook = useJsonBrook(jsonCode);
			jsonBrook.generate();
		}).toThrow();
	});
});

describe("数字", () => {
	test("正数", () => {
		const jsonCode = "10086";
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual(10086);
	});
	test("0", () => {
		const jsonCode = "0";
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual(0);
	});
	test("负数", () => {
		const jsonCode = "-10086";
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual(-10086);
	});
	test("小数", () => {
		const jsonCode = "10086.123";
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual(10086.123);
	});
	test("负小数", () => {
		const jsonCode = "-10086.123";
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual(-10086.123);
	});
	test("科学计数法", () => {
		const jsonCode = "1.23e4";
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual(1.23e4);
	});
	test("负科学计数法", () => {
		const jsonCode = "-1.23e-4";
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual(-1.23e-4);
	});
	test("仅负号", () => {
		expect(() => {
			const jsonCode = "-";
			const jsonBrook = useJsonBrook(jsonCode);
			jsonBrook.generate();
		}).toThrow();
	});
	test("末位为小数点", () => {
		expect(() => {
			const jsonCode = ".";
			const jsonBrook = useJsonBrook(jsonCode);
			jsonBrook.generate();
		}).toThrow();
	});
	test("末位为e", () => {
		expect(() => {
			const jsonCode = "10086e";
			const jsonBrook = useJsonBrook(jsonCode);
			jsonBrook.generate();
		}).toThrow();
	});
});
