export function isDigit(char: string) {
  return char >= '0' && char <= '9';
}

export function isDigitNotZero(char: string) {
  return char >= '1' && char <= '9';
}

export function isHex(char: string) {
  return (
    isDigit(char) ||
    (char >= 'a' && char <= 'f') ||
    (char >= 'A' && char <= 'F')
  );
}
