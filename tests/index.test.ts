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

const useParsingJsonBrook = (str: string) => {
	const jsonBrook = createJsonBrook();
	for (const char of str) {
		jsonBrook.parse(char);
	}
	return jsonBrook;
};

test("基础", () => {
	const json = {
		a: 1001,
		b: "hello",
		c: [1, 2, 3],
		d: null,
	};
	const jsonCode = JSON.stringify(json, null, 4);
	const jsonBrook = useJsonBrook(jsonCode);
	expect(jsonBrook.generate()).toStrictEqual(json);
	expect(jsonBrook.getRoot()).toBe(jsonBrook.getCurrent());
});

test("默认值", () => {
	const jsonBrook = createJsonBrook();
	expect(jsonBrook.generate()).toStrictEqual(void 0);
});

describe("关键词", () => {
	for (const keyword of [true, false, null]) {
		test(`${keyword}`, () => {
			const jsonCode = JSON.stringify(keyword);
			const jsonBrook = useJsonBrook(jsonCode);
			expect(jsonBrook.generate()).toStrictEqual(keyword);
		});
		test(`${keyword}首字母`, () => {
			const jsonCode = JSON.stringify(keyword);
			const jsonBrook = useParsingJsonBrook(jsonCode);
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
		const jsonCode = '"hello\\u0a20world!"';
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
	test("不完整的字符串解析中", () => {
		const jsonCode = `"Hello`;
		const jsonBrook = useParsingJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual("Hello");
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

describe("数组与对象", () => {
	test("简单数组", () => {
		const json = [1, "2", true, null];
		const jsonCode = JSON.stringify(json);
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual(json);
	});
	test("简单对象", () => {
		const json = { a: 1, b: "2", c: true, d: null };
		const jsonCode = JSON.stringify(json);
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual(json);
	});
	test("数组解析中", () => {
		const jsonCode = "[1, 2, 3";
		const jsonBrook = useParsingJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual([1, 2, 3]);
	});
	test("对象解析中", () => {
		const jsonCode = `{"a": 1, "b": 2`;
		const jsonBrook = useParsingJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual({ a: 1, b: 2 });
	});
	test("深度嵌套", () => {
		const json = {
			a: [1, { b: 2 }],
			c: { d: [3, 4] },
		};
		const jsonCode = JSON.stringify(json);
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual(json);
	});
	test("空数组与空对象", () => {
		const json = { a: [], b: {} };
		const jsonCode = JSON.stringify(json);
		const jsonBrook = useJsonBrook(jsonCode);
		expect(jsonBrook.generate()).toStrictEqual(json);
	});
});

describe("错误处理", () => {
	test("非法控制字符", () => {
		expect(() => {
			const jsonCode = `"\u0000"`;
			useJsonBrook(jsonCode);
		}).toThrow();
	});
	test("不完整的转义字符", () => {
		expect(() => {
			const jsonCode = `"\\u12"`;
			useJsonBrook(jsonCode);
		}).toThrow();
	});
	test("非法转义字符", () => {
		expect(() => {
			const jsonCode = `"\\x"`;
			useJsonBrook(jsonCode);
		}).toThrow();
	});
	test("对象缺失冒号", () => {
		expect(() => {
			const jsonCode = `{"a" 1}`;
			useJsonBrook(jsonCode);
		}).toThrow();
	});
	test("数组缺失逗号", () => {
		expect(() => {
			const jsonCode = `[1 2]`;
			useJsonBrook(jsonCode);
		}).toThrow();
	});
});
