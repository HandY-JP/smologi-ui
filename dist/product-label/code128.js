const CODE128_START_B = 104;
const CODE128_STOP = 106;
const CODE128_PATTERNS = [
  [2, 1, 2, 2, 2, 2],
  // 0
  [2, 2, 2, 1, 2, 2],
  // 1
  [2, 2, 2, 2, 2, 1],
  // 2
  [1, 2, 1, 2, 2, 3],
  // 3
  [1, 2, 1, 3, 2, 2],
  // 4
  [1, 3, 1, 2, 2, 2],
  // 5
  [1, 2, 2, 2, 1, 3],
  // 6
  [1, 2, 2, 3, 1, 2],
  // 7
  [1, 3, 2, 2, 1, 2],
  // 8
  [2, 2, 1, 2, 1, 3],
  // 9
  [2, 2, 1, 3, 1, 2],
  // 10
  [2, 3, 1, 2, 1, 2],
  // 11
  [1, 1, 2, 2, 3, 2],
  // 12
  [1, 2, 2, 1, 3, 2],
  // 13
  [1, 2, 2, 2, 3, 1],
  // 14
  [1, 1, 3, 2, 2, 2],
  // 15
  [1, 2, 3, 1, 2, 2],
  // 16
  [1, 2, 3, 2, 2, 1],
  // 17
  [2, 2, 3, 2, 1, 1],
  // 18
  [2, 2, 1, 1, 3, 2],
  // 19
  [2, 2, 1, 2, 3, 1],
  // 20
  [2, 1, 3, 2, 1, 2],
  // 21
  [2, 2, 3, 1, 1, 2],
  // 22
  [3, 1, 2, 1, 3, 1],
  // 23
  [3, 1, 1, 2, 2, 2],
  // 24
  [3, 2, 1, 1, 2, 2],
  // 25
  [3, 2, 1, 2, 2, 1],
  // 26
  [3, 1, 2, 2, 1, 2],
  // 27
  [3, 2, 2, 1, 1, 2],
  // 28
  [3, 2, 2, 2, 1, 1],
  // 29
  [2, 1, 2, 1, 2, 3],
  // 30
  [2, 1, 2, 3, 2, 1],
  // 31
  [2, 3, 2, 1, 2, 1],
  // 32
  [1, 1, 1, 3, 2, 3],
  // 33
  [1, 3, 1, 1, 2, 3],
  // 34
  [1, 3, 1, 3, 2, 1],
  // 35
  [1, 1, 2, 3, 1, 3],
  // 36
  [1, 3, 2, 1, 1, 3],
  // 37
  [1, 3, 2, 3, 1, 1],
  // 38
  [2, 1, 1, 3, 1, 3],
  // 39
  [2, 3, 1, 1, 1, 3],
  // 40
  [2, 3, 1, 3, 1, 1],
  // 41
  [1, 1, 2, 1, 3, 3],
  // 42
  [1, 1, 2, 3, 3, 1],
  // 43
  [1, 3, 2, 1, 3, 1],
  // 44
  [1, 1, 3, 1, 2, 3],
  // 45
  [1, 1, 3, 3, 2, 1],
  // 46
  [1, 3, 3, 1, 2, 1],
  // 47
  [3, 1, 3, 1, 2, 1],
  // 48
  [2, 1, 1, 3, 3, 1],
  // 49
  [2, 3, 1, 1, 3, 1],
  // 50
  [2, 1, 3, 1, 1, 3],
  // 51
  [2, 1, 3, 3, 1, 1],
  // 52
  [2, 1, 3, 1, 3, 1],
  // 53
  [3, 1, 1, 1, 2, 3],
  // 54
  [3, 1, 1, 3, 2, 1],
  // 55
  [3, 3, 1, 1, 2, 1],
  // 56
  [3, 1, 2, 1, 1, 3],
  // 57
  [3, 1, 2, 3, 1, 1],
  // 58
  [3, 3, 2, 1, 1, 1],
  // 59
  [3, 1, 4, 1, 1, 1],
  // 60
  [2, 2, 1, 4, 1, 1],
  // 61
  [4, 3, 1, 1, 1, 1],
  // 62
  [1, 1, 1, 2, 2, 4],
  // 63
  [1, 1, 1, 4, 2, 2],
  // 64
  [1, 2, 1, 1, 2, 4],
  // 65
  [1, 2, 1, 4, 2, 1],
  // 66
  [1, 4, 1, 1, 2, 2],
  // 67
  [1, 4, 1, 2, 2, 1],
  // 68
  [1, 1, 2, 2, 1, 4],
  // 69
  [1, 1, 2, 4, 1, 2],
  // 70
  [1, 2, 2, 1, 1, 4],
  // 71
  [1, 2, 2, 4, 1, 1],
  // 72
  [1, 4, 2, 1, 1, 2],
  // 73
  [1, 4, 2, 2, 1, 1],
  // 74
  [2, 4, 1, 2, 1, 1],
  // 75
  [2, 2, 1, 1, 1, 4],
  // 76
  [4, 1, 3, 1, 1, 1],
  // 77
  [2, 4, 1, 1, 1, 2],
  // 78
  [1, 3, 4, 1, 1, 1],
  // 79
  [1, 1, 1, 2, 4, 2],
  // 80
  [1, 2, 1, 1, 4, 2],
  // 81
  [1, 2, 1, 2, 4, 1],
  // 82
  [1, 1, 4, 2, 1, 2],
  // 83
  [1, 2, 4, 1, 1, 2],
  // 84
  [1, 2, 4, 2, 1, 1],
  // 85
  [4, 1, 1, 2, 1, 2],
  // 86
  [4, 2, 1, 1, 1, 2],
  // 87
  [4, 2, 1, 2, 1, 1],
  // 88
  [2, 1, 2, 1, 4, 1],
  // 89
  [2, 1, 4, 1, 2, 1],
  // 90
  [4, 1, 2, 1, 2, 1],
  // 91
  [1, 1, 1, 1, 4, 3],
  // 92
  [1, 1, 1, 3, 4, 1],
  // 93
  [1, 3, 1, 1, 4, 1],
  // 94
  [1, 1, 4, 1, 1, 3],
  // 95
  [1, 1, 4, 3, 1, 1],
  // 96
  [4, 1, 1, 1, 1, 3],
  // 97
  [4, 1, 1, 3, 1, 1],
  // 98
  [1, 1, 3, 1, 4, 1],
  // 99
  [1, 1, 4, 1, 3, 1],
  // 100
  [3, 1, 1, 1, 4, 1],
  // 101
  [4, 1, 1, 1, 3, 1],
  // 102
  [2, 1, 1, 4, 1, 2],
  // 103 START A
  [2, 1, 1, 2, 1, 4],
  // 104 START B
  [2, 1, 1, 2, 3, 2],
  // 105 START C
  [2, 3, 3, 1, 1, 1, 2]
  // 106 STOP
];
const CODE128B_MIN_CHAR_CODE = 32;
const CODE128B_MAX_CHAR_CODE = 126;
function code128BCharValue(char) {
  const code = char.charCodeAt(0);
  if (code < CODE128B_MIN_CHAR_CODE || code > CODE128B_MAX_CHAR_CODE) {
    throw new Error(`Code128B \u3067\u7B26\u53F7\u5316\u3067\u304D\u306A\u3044\u6587\u5B57\u3067\u3059: ${JSON.stringify(char)}`);
  }
  return code - CODE128B_MIN_CHAR_CODE;
}
function isCode128BEncodable(text) {
  if (!text) return false;
  return Array.from(text).every((char) => {
    const code = char.charCodeAt(0);
    return code >= CODE128B_MIN_CHAR_CODE && code <= CODE128B_MAX_CHAR_CODE;
  });
}
function code128BEncodeValues(text) {
  const dataValues = Array.from(text).map(code128BCharValue);
  const values = [CODE128_START_B, ...dataValues];
  let checksum = values[0];
  for (let i = 1; i < values.length; i++) {
    checksum += values[i] * i;
  }
  checksum %= 103;
  return [...values, checksum, CODE128_STOP];
}
function code128Widths(values) {
  return values.flatMap((value) => {
    const pattern = CODE128_PATTERNS[value];
    if (!pattern) throw new Error(`\u672A\u5B9A\u7FA9\u306E Code128 \u5024\u3067\u3059: ${value}`);
    return pattern;
  });
}
function code128Bars(text) {
  const widths = code128Widths(code128BEncodeValues(text));
  const bars = [];
  let x = 0;
  let isBar = true;
  for (const width of widths) {
    if (isBar) bars.push({ x, width });
    x += width;
    isBar = !isBar;
  }
  return { bars, totalModules: x };
}
export {
  CODE128_START_B,
  CODE128_STOP,
  code128BCharValue,
  code128BEncodeValues,
  code128Bars,
  code128Widths,
  isCode128BEncodable
};
//# sourceMappingURL=code128.js.map