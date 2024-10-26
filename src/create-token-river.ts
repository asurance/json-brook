export type SymbolValue = '{' | '}' | '[' | ']' | ':' | ',';

export type SymbolToken = {
  type: 'Symbol';
  value: SymbolValue;
};

export type KeywordValue = 'true' | 'false' | 'null';

export type KeywordToken = {
  type: 'Keyword';
  value: KeywordValue;
};

export type KeywordCurrent = {
  type: 'Keyword';
  value: KeywordValue;

  matchedIndex: number;
};

export enum StringState {
  Normal = 0,
  Escape = 1,
}

export type StringToken = {
  type: 'String';
  value: string;
};

export type StringCurrent = {
  type: 'String';
  state: StringState;
  value: string;
  escapeIndex: number;
};

export enum NumberState {
  Negative = 1,
  Zero = 2,
  Digit = 3,
  Point = 4,
  DigitFraction = 5,
  Exp = 6,
  ExpDigitOrSign = 7,
}

export type NumberToken = {
  type: 'Number';
  value: number;
};

export type NumberCurrent = {
  type: 'Number';
  state: NumberState;
  value: string;
  passed: boolean;
};

export type Token = SymbolToken | KeywordToken | StringToken | NumberToken;

const whiteSpaces = [' ', '\t', '\n', '\r'];

const symbols: SymbolValue[] = ['{', '}', '[', ']', ':', ','];

const keywords: KeywordValue[] = ['true', 'false', 'null'];

const keywordsStart = keywords.map(keyword => keyword.charAt(0));

const escapes = ['"', '\\', '/', 'b', 'f', 'n', 'r', 't'];

const hexEscape = 'u';

const flags = ['+', '-'];

function isDigit(char: string) {
  return char >= '0' && char <= '9';
}

function isDigitNotZero(char: string) {
  return char >= '1' && char <= '9';
}

function isHex(char: string) {
  return (
    isDigit(char) ||
    (char >= 'a' && char <= 'f') ||
    (char >= 'A' && char <= 'F')
  );
}

function isExp(char: string) {
  return char === 'e' || char === 'E';
}

export default function createTokenRiver() {
  let current: KeywordCurrent | StringCurrent | NumberCurrent | null = null;

  const write = (char: string): Token | Token[] | null => {
    if (current) {
      switch (current.type) {
        case 'Keyword':
          if (char === keywords[current.matchedIndex + 1]) {
            current.matchedIndex++;
            if (current.matchedIndex === current.value.length - 1) {
              const token: KeywordToken = {
                type: 'Keyword',
                value: current.value,
              };
              current = null;
              return token;
            }
            return null;
          }
          throw new Error('解析失败');
        case 'String':
          switch (current.state) {
            case StringState.Normal:
              switch (char) {
                case '"': {
                  current.value += char;
                  const token: StringToken = {
                    type: 'String',
                    value: JSON.parse(current.value),
                  };
                  current = null;
                  return token;
                }
                case '\\':
                  current.state = StringState.Escape;
                  current.value += char;
                  current.escapeIndex = 0;
                  return null;
                default:
                  current.value += char;
                  return null;
              }
            case StringState.Escape: {
              if (current.escapeIndex === 0) {
                if (escapes.includes(char)) {
                  current.state = StringState.Normal;
                  current.value += char;
                  return null;
                }
                if (char === hexEscape) {
                  current.value += char;
                  current.escapeIndex++;
                  return null;
                }
                throw new Error('解析失败');
              } else {
                if (isHex(char)) {
                  if (current.escapeIndex === 4) {
                    current.state = StringState.Normal;
                    current.value += char;
                    return null;
                  } else {
                    current.value += char;
                    current.escapeIndex++;
                    return null;
                  }
                } else {
                  throw new Error('解析失败');
                }
              }
            }
          }
        case 'Number':
          switch (current.state) {
            case NumberState.Negative:
              if (char === '0') {
                current.state = NumberState.Zero;
                current.value += char;
                current.passed = true;
                return null;
              }
              if (isDigitNotZero(char)) {
                current.state = NumberState.Digit;
                current.value += char;
                current.passed = true;
                return null;
              }
              throw new Error('解析失败');
            case NumberState.Zero:
              if (char === '.') {
                current.state = NumberState.Point;
                current.value += char;
                current.passed = false;
                return null;
              }
              if (isExp(char)) {
                current.state = NumberState.Exp;
                current.value += char;
                current.passed = false;
                return null;
              }
              if (current.passed) {
                const token: NumberToken = {
                  type: 'Number',
                  value: JSON.parse(current.value),
                };
                current = null;
                const next = write(char);
                if (next) {
                  return Array.isArray(next) ? [token, ...next] : [token, next];
                } else {
                  return token;
                }
              }
              throw new Error('解析失败');
            case NumberState.Digit:
              if (isDigit(char)) {
                current.value += char;
                current.passed = true;
                return null;
              }
              if (char === '.') {
                current.state = NumberState.Point;
                current.value += char;
                current.passed = false;
                return null;
              }
              if (isExp(char)) {
                current.state = NumberState.Exp;
                current.value += char;
                current.passed = false;
                return null;
              }
              if (current.passed) {
                const token: NumberToken = {
                  type: 'Number',
                  value: JSON.parse(current.value),
                };
                current = null;
                const next = write(char);
                if (next) {
                  return Array.isArray(next) ? [token, ...next] : [token, next];
                } else {
                  return token;
                }
              }
              throw new Error('解析失败');
            case NumberState.Point:
              if (isDigit(char)) {
                current.state = NumberState.DigitFraction;
                current.value += char;
                current.passed = true;
                return null;
              }
              if (current.passed) {
                const token: NumberToken = {
                  type: 'Number',
                  value: JSON.parse(current.value),
                };
                current = null;
                const next = write(char);
                if (next) {
                  return Array.isArray(next) ? [token, ...next] : [token, next];
                } else {
                  return token;
                }
              }
              throw new Error('解析失败');
            case NumberState.DigitFraction:
              if (isDigit(char)) {
                current.value += char;
                current.passed = true;
                return null;
              }
              if (isExp(char)) {
                current.state = NumberState.Exp;
                current.value += char;
                current.passed = false;
                return null;
              }
              if (current.passed) {
                const token: NumberToken = {
                  type: 'Number',
                  value: JSON.parse(current.value),
                };
                current = null;
                const next = write(char);
                if (next) {
                  return Array.isArray(next) ? [token, ...next] : [token, next];
                } else {
                  return token;
                }
              }
              throw new Error('解析失败');
            case NumberState.Exp:
              if (flags.includes(char)) {
                current.state = NumberState.ExpDigitOrSign;
                current.value += char;
                current.passed = false;
                return null;
              }
              if (isDigit(char)) {
                current.state = NumberState.ExpDigitOrSign;
                current.value += char;
                current.passed = true;
                return null;
              }
              if (current.passed) {
                const token: NumberToken = {
                  type: 'Number',
                  value: JSON.parse(current.value),
                };
                current = null;
                const next = write(char);
                if (next) {
                  return Array.isArray(next) ? [token, ...next] : [token, next];
                } else {
                  return token;
                }
              }
              throw new Error('解析失败');
            case NumberState.ExpDigitOrSign:
              if (isDigit(char)) {
                current.value += char;
                current.passed = true;
                return null;
              }
              if (current.passed) {
                const token: NumberToken = {
                  type: 'Number',
                  value: JSON.parse(current.value),
                };
                current = null;
                const next = write(char);
                if (next) {
                  return Array.isArray(next) ? [token, ...next] : [token, next];
                } else {
                  return token;
                }
              }
              throw new Error('解析失败');
          }
      }
    } else {
      if (whiteSpaces.includes(char)) {
        return null;
      }
      if (symbols.includes(char as SymbolValue)) {
        return {
          type: 'Symbol',
          value: char as SymbolValue,
        };
      }
      const keywordIndex = keywordsStart.indexOf(char);
      if (keywordIndex >= 0) {
        current = {
          type: 'Keyword',
          value: keywords[keywordIndex],
          matchedIndex: 0,
        };
        return null;
      }
      if (char === '"') {
        current = {
          type: 'String',
          state: StringState.Normal,
          value: '"',
          escapeIndex: 0,
        };
        return null;
      }
      if (char === '-') {
        current = {
          type: 'Number',
          state: NumberState.Negative,
          value: char,
          passed: false,
        };
        return null;
      }
      if (char === '0') {
        current = {
          type: 'Number',
          state: NumberState.Zero,
          value: char,
          passed: true,
        };
        return null;
      }
      if (isDigitNotZero(char)) {
        current = {
          type: 'Number',
          state: NumberState.Digit,
          value: char,
          passed: true,
        };
        return null;
      }
      throw new Error('解析失败');
    }
  };

  const end = (): NumberToken | null => {
    if (current) {
      switch (current.type) {
        case 'Keyword':
        case 'String':
          throw new Error('解析失败');
        case 'Number':
          if (current.passed) {
            const token: NumberToken = {
              type: 'Number',
              value: JSON.parse(current.value),
            };
            current = null;
            return token;
          }
          return null;
      }
    }
    return null;
  };
  return {
    write,
    end,
  };
}
