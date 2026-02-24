export type SymbolValue = "{" | "}" | "[" | "]" | ":" | ",";

export type SymbolToken = {
	type: "symbol";
	value: SymbolValue;
};

export type KeywordValue = "true" | "false" | "null";

export type KeywordToken = {
	type: "keyword";
	value: boolean | null;
};

export type KeywordTokenCurrent = {
	type: "keyword";
	value: KeywordValue;
	matchLength: number;
};

export const StringTokenState = {
	Normal: 1,
	Escape: 2,
} as const;

export type StringTokenState =
	(typeof StringTokenState)[keyof typeof StringTokenState];

export type StringToken = {
	type: "string";
	value: string;
};

export type StringTokenCurrent = {
	type: "string";
	state: StringTokenState;
	value: string;
	escapeLength: number;
};

export const NumberTokenState = {
	Negative: 1,
	Zero: 2,
	Digit: 3,
	Point: 4,
	DigitFraction: 5,
	Exp: 6,
	ExpDigitOrSign: 7,
} as const;

export type NumberTokenState =
	(typeof NumberTokenState)[keyof typeof NumberTokenState];

export type NumberToken = {
	type: "number";
	value: number;
};

export type NumberTokenCurrent = {
	type: "number";
	state: NumberTokenState;
	value: string;
	validLength: number;
};

export type Token = SymbolToken | KeywordToken | StringToken | NumberToken;

export type TokenCurrent =
	| KeywordTokenCurrent
	| StringTokenCurrent
	| NumberTokenCurrent;

const whiteSpaces = [" ", "\t", "\n", "\r"];

const symbols: SymbolValue[] = ["{", "}", "[", "]", ":", ","];

const keywords: KeywordValue[] = ["true", "false", "null"];

const keywordsStart = keywords.map((keyword) => keyword[0]);

const escapes = ['"', "\\", "/", "b", "f", "n", "r", "t"];

const flags = ["+", "-"];

const isDigit = (char: string) => char >= "0" && char <= "9";

const isDigitNotZero = (char: string) => char >= "1" && char <= "9";

const isHex = (char: string) =>
	isDigit(char) || (char >= "a" && char <= "f") || (char >= "A" && char <= "F");

const isExp = (char: string) => char === "e" || char === "E";

export const parseNextToken = (char: string) => {
	if (whiteSpaces.includes(char)) {
		return {
			token: null,
			current: null,
		};
	}
	if (symbols.includes(char as SymbolValue)) {
		return {
			token: {
				type: "symbol",
				value: char as SymbolValue,
			} as SymbolToken,
			current: null,
		};
	}
	const keywordIndex = keywordsStart.indexOf(char);
	if (keywordIndex !== -1) {
		return {
			token: null,
			current: {
				type: "keyword",
				value: keywords[keywordIndex],
				matchLength: 1,
			} as KeywordTokenCurrent,
		};
	}
	if (char === '"') {
		return {
			token: null,
			current: {
				type: "string",
				state: StringTokenState.Normal,
				value: char,
				escapeLength: 0,
			} as StringTokenCurrent,
		};
	}
	if (char === "-") {
		return {
			token: null,
			current: {
				type: "number",
				state: NumberTokenState.Negative,
				value: char,
				validLength: 0,
			} as NumberTokenCurrent,
		};
	}
	if (char === "0") {
		return {
			token: null,
			current: {
				type: "number",
				state: NumberTokenState.Zero,
				value: char,
				validLength: 1,
			} as NumberTokenCurrent,
		};
	}
	if (isDigitNotZero(char)) {
		return {
			token: null,
			current: {
				type: "number",
				state: NumberTokenState.Digit,
				value: char,
				validLength: 1,
			} as NumberTokenCurrent,
		};
	}
	throw new Error("解析失败");
};

export const parseNextTokenWithKeyword = (
	char: string,
	current: KeywordTokenCurrent,
) => {
	if (char === current.value[current.matchLength]) {
		current.matchLength++;
		if (current.matchLength === current.value.length) {
			return {
				token: {
					type: "keyword",
					value: JSON.parse(current.value),
				} as KeywordToken,
				current: null,
			};
		} else {
			return {
				token: null,
				current,
			};
		}
	}
	throw new Error("解析失败");
};

export const parseNextTokenWithString = (
	char: string,
	current: StringTokenCurrent,
) => {
	switch (current.state) {
		case StringTokenState.Normal:
			switch (char) {
				case '"':
					current.value += char;
					return {
						token: {
							type: "string",
							value: current.value,
						} as StringToken,
						current: null,
					};
				case "\\":
					current.state = StringTokenState.Escape;
					current.value += char;
					current.escapeLength = 1;
					return {
						token: null,
						current,
					};
				default:
					current.value += char;
					return {
						token: null,
						current,
					};
			}
		case StringTokenState.Escape:
			if (current.escapeLength === 1) {
				if (escapes.includes(char)) {
					current.state = StringTokenState.Normal;
					current.value += char;
					current.escapeLength = 0;
					return {
						token: null,
						current,
					};
				}
				if (char === "u") {
					current.value += char;
					current.escapeLength++;
					return {
						token: null,
						current,
					};
				}
				throw new Error("解析失败");
			}
			if (isHex(char)) {
				if (current.escapeLength === 6) {
					current.state = StringTokenState.Normal;
					current.value += char;
					current.escapeLength = 0;
					return {
						token: null,
						current,
					};
				} else {
					current.value += char;
					current.escapeLength++;
					return {
						token: null,
						current,
					};
				}
			}
			throw new Error("解析失败");
	}
};

export const parseNextTokenWithNumber = (
	char: string,
	current: NumberTokenCurrent,
) => {
	switch (current.state) {
		case NumberTokenState.Negative:
			if (char === "0") {
				current.state = NumberTokenState.Zero;
				current.value += char;
				current.validLength = current.value.length;
				return {
					token: null,
					current,
				};
			}
			if (isDigitNotZero(char)) {
				current.state = NumberTokenState.Digit;
				current.value += char;
				current.validLength = current.value.length;
				return {
					token: null,
					current,
				};
			}
			throw new Error("解析失败");
		case NumberTokenState.Zero: {
			if (char === ".") {
				current.state = NumberTokenState.Point;
				current.value += char;
				return {
					token: null,
					current,
				};
			}
			if (isExp(char)) {
				current.state = NumberTokenState.Exp;
				current.value += char;
				return {
					token: null,
					current,
				};
			}
			return {
				token: {
					type: "number",
					value: JSON.parse(current.value),
				} as NumberToken,
				current: null,
				char,
			};
		}
		case NumberTokenState.Digit: {
			if (isDigit(char)) {
				current.value += char;
				current.validLength = current.value.length;
				return {
					token: null,
					current,
				};
			}
			if (char === ".") {
				current.state = NumberTokenState.Point;
				current.value += char;
				return {
					token: null,
					current,
				};
			}
			if (isExp(char)) {
				current.state = NumberTokenState.Exp;
				current.value += char;
				return {
					token: null,
					current,
				};
			}
			return {
				token: {
					type: "number",
					value: JSON.parse(current.value),
				} as NumberToken,
				current: null,
				char,
			};
		}
		case NumberTokenState.Point:
			if (isDigit(char)) {
				current.state = NumberTokenState.DigitFraction;
				current.value += char;
				current.validLength = current.value.length;
				return {
					token: null,
					current,
				};
			}
			throw new Error("解析失败");
		case NumberTokenState.DigitFraction: {
			if (isDigit(char)) {
				current.value += char;
				current.validLength = current.value.length;
				return {
					token: null,
					current,
				};
			}
			if (isExp(char)) {
				current.state = NumberTokenState.Exp;
				current.value += char;
				return {
					token: null,
					current,
				};
			}
			return {
				token: {
					type: "number",
					value: JSON.parse(current.value),
				} as NumberToken,
				current: null,
				char,
			};
		}
		case NumberTokenState.Exp:
			if (flags.includes(char)) {
				current.state = NumberTokenState.ExpDigitOrSign;
				current.value += char;
				return {
					token: null,
					current,
				};
			}
			if (isDigit(char)) {
				current.state = NumberTokenState.ExpDigitOrSign;
				current.value += char;
				current.validLength = current.value.length;
				return {
					token: null,
					current,
				};
			}
			throw new Error("解析失败");
		case NumberTokenState.ExpDigitOrSign:
			if (isDigit(char)) {
				current.value += char;
				current.validLength = current.value.length;
				return {
					token: null,
					current,
				};
			}
			if (current.validLength === current.value.length) {
				return {
					token: {
						type: "number",
						value: JSON.parse(current.value),
					} as NumberToken,
					current: null,
					char,
				};
			}
			throw new Error("解析失败");
	}
};

export const endNumberTokenCurrent = (current: NumberTokenCurrent) => {
	if (current.validLength === current.value.length) {
		return {
			type: "number",
			value: JSON.parse(current.value),
		} as NumberToken;
	}
	throw new Error("解析失败");
};
