import { isHex } from './utils';

export type SymbolValue = '{' | '}' | '[' | ']' | ':' | ',';

export type KeywordValue = 'true' | 'false' | 'null';

enum StringState {
  Normal = 0,
  Escape = 1,
}

export type SymbolToken = {
  type: 'Symbol';
  value: SymbolValue;
};

export type StringToken = {
  type: 'String';
  state: StringState;
  escapeIndex: number;
  value: string;
};

export type NumberToken = {
  type: 'Number';
  value: number;
};

export type KeywordToken = {
  type: 'Keyword';
  matchedIndex: number;
  value: KeywordValue;
};

export type Token = SymbolToken | StringToken | NumberToken | KeywordToken;

const symbols: SymbolValue[] = ['{', '}', '[', ']', ':', ','];

const keywords: KeywordValue[] = ['true', 'false', 'null'];

const keywordsStart = keywords.map(keyword => keyword.charAt(0));

const escapes = ['"', '\\', '/', 'b', 'f', 'n', 'r', 't'];

const hexEscape = 'u';

export default class TokenRiver {
  private _tokens: Token[] = [];
  private _current: StringToken | NumberToken | KeywordToken | null = null;
  write(str: string) {
    let index = 0;
    while (index < str.length) {
      const char = str.charAt(index);
      if (['\r', '\n', '\t', ' '].includes(str[index])) {
        index++;
        continue;
      }
      if (this._current) {
        switch (this._current.type) {
          case 'Keyword':
            if (char === this._current.value[this._current.matchedIndex + 1]) {
              this._current.matchedIndex++;
              if (
                this._current.matchedIndex ===
                this._current.value.length - 1
              ) {
                this._tokens.push(this._current);
                this._current = null;
              }
              index++;
              continue;
            }
            throw new Error('未知关键字');
          case 'String':
            switch (this._current.state) {
              case StringState.Normal:
                switch (char) {
                  case '"':
                    this._tokens.push(this._current);
                    this._current = null;
                    index++;
                    continue;
                  case '\\':
                    this._current.state = StringState.Escape;
                    this._current.value += char;
                    index++;
                    continue;
                  default:
                    this._current.value += char;
                    index++;
                    continue;
                }
              case StringState.Escape:
                if (this._current.escapeIndex === 0) {
                  if (escapes.includes(char)) {
                    this._current.state = StringState.Normal;
                    this._current.value += char;
                    index++;
                    continue;
                  }
                  if (char === hexEscape) {
                    this._current.escapeIndex = 1;
                    this._current.value += char;
                    index++;
                    continue;
                  }
                  throw new Error('未知转义字符');
                  // biome-ignore lint/style/noUselessElse: 符合预期
                } else {
                  if (isHex(char)) {
                    if (this._current.escapeIndex === 4) {
                      this._current.state = StringState.Normal;
                      this._current.escapeIndex = 0;
                    } else {
                      this._current.escapeIndex++;
                    }
                    this._current.value += char;
                    index++;
                    continue;
                  }
                  throw new Error('未知转义字符');
                }
            }
          case 'Number':
            // todo
            break;
        }
      } else {
        if (symbols.includes(char as SymbolValue)) {
          this._tokens.push({
            type: 'Symbol',
            value: char as SymbolValue,
          });
          index++;
          continue;
        }
        const keywordIndex = keywordsStart.indexOf(char);
        if (keywordIndex >= 0) {
          this._current = {
            type: 'Keyword',
            matchedIndex: 0,
            value: keywords[keywordIndex],
          };
          index++;
          continue;
        }
        if (char === '"') {
          this._current = {
            type: 'String',
            value: '',
            state: StringState.Normal,
            escapeIndex: 0,
          };
          index++;
          continue;
        }
        throw new Error('未知字符');
      }
      throw new Error('未知错误');
    }
  }
  end() {
    if (this._current) {
      switch (this._current.type) {
        case 'Keyword':
          throw new Error('关键字未结束');
        case 'String':
          if (this._current.state === StringState.Normal) {
            this._tokens.push(this._current);
            this._current = null;
          }
          throw new Error('转义字符未结束');
        case 'Number':
          // todo
          break;
      }
    }
  }
}
