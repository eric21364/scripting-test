import { HStack } from "scripting";
import { KeyView } from "./Key";
import { selectStore, KeyboardLang } from "../store";

declare const CustomKeyboard: any;

const ZH_MAP: Record<string, string> = {
  '1': 'ㄅ', '2': 'ㄉ', '3': 'ˇ', '4': 'ˋ', '5': 'ㄓ', '6': 'ˊ', '7': '˙', '8': 'ㄚ', '9': 'ㄞ', '0': 'ㄢ',
  'Q': 'ㄆ', 'W': 'ㄊ', 'E': 'ㄍ', 'R': 'ㄐ', 'T': 'ㄔ', 'Y': 'ㄗ', 'U': 'ㄧ', 'I': 'ㄛ', 'O': 'ㄝ', 'P': 'ㄣ',
  'A': 'ㄇ', 'S': 'ㄋ', 'D': 'ㄎ', 'F': 'ㄑ', 'G': 'ㄒ', 'H': 'ㄕ', 'J': 'ㄨ', 'K': 'ㄜ', 'L': 'ㄠ', ';': 'ㄤ',
  'Z': 'ㄈ', 'X': 'ㄌ', 'C': 'ㄏ', 'V': 'ㄖ', 'B': 'ㄙ', 'N': 'ㄩ', 'M': 'ㄝ', ',': 'ㄡ', '.': 'ㄥ', '/': '/' 
};

// 🆕 符號模式映射 (iOS 18 標準版型)
const SYM_MAP: Record<string, string> = {
  '1': '[', '2': ']', '3': '{', '4': '}', '5': '#', '6': '%', '7': '^', '8': '*', '9': '+', '0': '=',
  'Q': '-', 'W': '/', 'E': ':', 'R': ';', 'T': '(', 'Y': ')', 'U': '$', 'I': '&', 'O': '@', 'P': '"',
  'A': '.', 'S': ',', 'D': '?', 'F': '!', 'G': "'", 'H': '_', 'J': '\\', 'K': '|', 'L': '~', ';': '`',
  'Z': '<', 'X': '>', 'C': '€', 'V': '£', 'B': '¥', 'N': '·', 'M': '¿'
};

export function RowView({
  chars, spacing = 4, keyWidth = 35, fontSize
}: {
  chars: string
  spacing?: number
  keyWidth?: number
  fontSize?: number
}) {
  const { lang, capsState, isSymbols } = selectStore(store => ({
    lang: store.lang,
    capsState: store.capsState,
    isSymbols: store.isSymbols
  }));

  const processChar = (c: string) => {
    // 🛡️ 龍蝦準則：符號模式優先
    if (isSymbols) {
      return SYM_MAP[c] || c;
    }
    if (lang === KeyboardLang.ZH) {
      return ZH_MAP[c] || c;
    }
    if (c.length === 1) {
      return capsState !== 0 ? c.toUpperCase() : c.toLowerCase();
    }
    return c;
  };

  return <HStack spacing={spacing} alignment="center">
    {chars.split(' ').map((c, i) =>
      <KeyView
        key={`${lang}-${i}-${c}`}
        title={processChar(c)}
        minWidth={keyWidth}
        fontSize={fontSize}
        action={() => {
          CustomKeyboard.insertText(processChar(c));
        }}
      />
    )}
  </HStack>
}
