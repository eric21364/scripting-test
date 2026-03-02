// 🌊 龍蝦暗號波段映射 (Hex-to-Sea-Creatures)
const EMOJI_MAP: Record<string, string> = {
  '0': '🦀', '1': '🦞', '2': '🦐', '3': '🦑', '4': '🐙', '5': '🐚', '6': '🐟', '7': '🐠',
  '8': '🐡', '9': '🦈', 'a': '🐳', 'b': '🐬', 'c': '🐋', 'd': '🐢', 'e': '🐧', 'f': '🌟'
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(EMOJI_MAP).map(([k, v]) => [v, k])
);

export const MARKER = '🔱';

export function encode(text: string): string {
  if (!text) return "";
  const hex = Array.from(new TextEncoder().encode(text))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const emojis = Array.from(hex).map(char => EMOJI_MAP[char] || char).join('');
  return `${MARKER}${emojis}${MARKER}`;
}

export function decode(cipher: string): string {
  if (!cipher || !cipher.includes(MARKER)) return "無效暗號";
  const content = cipher.split(MARKER)[1];
  if (!content) return "暗號落空";

  // 取得 Emoji 陣列 (處理 multi-byte emojis)
  const emojis = Array.from(content);
  let hex = "";
  for (const e of emojis) {
    if (REVERSE_MAP[e]) {
      hex += REVERSE_MAP[e];
    } else {
      return "非龍蝦波段";
    }
  }

  try {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    return new TextDecoder().decode(bytes);
  } catch (e) {
    return "解讀失敗";
  }
}
