// 🌊 龍蝦暗號波段映射 (Hex-to-Sea-Creatures)
const EMOJI_MAP: Record<string, string> = {
  '0': '🦀', '1': '🦞', '2': '🦐', '3': '🦑', '4': '🐙', '5': '🐚', '6': '🐟', '7': '🐠',
  '8': '🐡', '9': '🦈', 'a': '🐳', 'b': '🐬', 'c': '🐋', 'd': '🐢', 'e': '🐧', 'f': '🌟'
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(EMOJI_MAP).map(([k, v]) => [v, k])
);

export const MARKER = '🔱';

// 🛠️ 手動 UTF-8 轉 Hex (不依賴 TextEncoder)
function stringToHex(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 128) {
      result += code.toString(16).padStart(2, '0');
    } else {
      // 處理多字節 (簡單 UTF-8 編碼邏輯)
      const encoded = encodeURIComponent(str[i]).replace(/%/g, '');
      result += encoded.toLowerCase();
    }
  }
  return result;
}

// 🛠️ 手動 Hex 轉 UTF-8 (不依賴 TextDecoder)
function hexToString(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += '%' + hex.substring(i, i + 2);
  }
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return '解析錯誤';
  }
}

export function encode(text: string): string {
  if (!text) return "";
  const hex = stringToHex(text);
  const emojis = Array.from(hex).map(char => EMOJI_MAP[char] || char).join('');
  return `${MARKER}${emojis}${MARKER}`;
}

export function decode(cipher: string): string {
  if (!cipher || !cipher.includes(MARKER)) return "無效暗號";
  const parts = cipher.split(MARKER);
  // 尋找包含海底生物的區段
  const content = parts.find(p => Array.from(p).some(e => REVERSE_MAP[e])) || "";
  if (!content) return "暗號落空";

  const emojis = Array.from(content);
  let hex = "";
  for (const e of emojis) {
    if (REVERSE_MAP[e]) {
      hex += REVERSE_MAP[e];
    }
  }

  return hexToString(hex);
}
