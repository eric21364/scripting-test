import { HStack } from "scripting";
import { KeyView } from "./Key";
import { selectStore, KeyboardLang } from "../store";

declare const CustomKeyboard: any;

// 🧪 注音映射：iOS 18 標準版型 (ˋ 改至 ˇ 右側)
const ZH_MAP: Record<string, string> = {
  '1': 'ㄅ', '2': 'ㄉ', '3': 'ˇ', '4': 'ˋ', '5': 'ㄓ', '6': 'ˊ', '7': '˙', '8': 'ㄚ', '9': 'ㄞ', '0': 'ㄢ',
  'Q': 'ㄆ', 'W': 'ㄊ', 'E': 'ㄍ', 'R': 'ㄐ', 'T': 'ㄘ', 'Y': 'ㄙ', 'U': 'ㄧ', 'I': 'ㄛ', 'O': 'ㄝ', 'P': 'ㄣ',
  'A': 'ㄇ', 'S': 'ㄋ', 'D': 'ㄎ', 'F': 'ㄑ', 'G': 'ㄒ', 'H': 'ㄕ', 'J': 'ㄨ', 'K': 'ㄜ', 'L': 'ㄠ', ';': 'ㄤ',
  'Z': 'ㄈ', 'X': 'ㄌ', 'C': 'ㄏ', 'V': 'ㄖ', 'B': 'ㄙ', 'N': 'ㄩ', 'M': 'ㄝ', ',': 'ㄡ', '.': 'ㄥ', '/': '/' 
};

// 🧪 符號模式映射 (iOS 18 標準全量複刻)
const SYM_MAP: Record<string, string> = {
  '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
  'Q': '-', 'W': '/', 'E': ':', 'R': ';', 'T': '(', 'Y': ')', 'U': '$', 'I': '&', 'O': '@', 'P': '"',
  'A': '[', 'S': ']', 'D': '{', 'E': '}', 'F': '#', 'G': '%', 'H': '^', 'J': '*', 'K': '+', 'L': '=',
  'Z': '_', 'X': '\\', 'C': '|', 'V': '~', 'B': '<', 'N': '>', 'M': '?', ',': '!', '.': '.', '/': '/'
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
    // 🛡️ 龍蝦準則：符號模式優先。若 key 存在於 SYM_MAP 則輸出，否則輸出 c 原文 (如數字)
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
        key={`${lang}-${isSymbols}-${c}-${i}`}
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
