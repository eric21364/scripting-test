import { HStack } from "scripting";
import { KeyView } from "./Key";
import { selectStore, KeyboardLang } from "../store";

declare const CustomKeyboard: any;

/**
 * 🧪 龍蝦標準注音映射 (IBM/QWERTY Standard)
 * 修正了 v2.0.7 中的位元偏差
 */
const ZH_MAP: Record<string, string> = {
  'Q': 'ㄆ', 'W': 'ㄊ', 'E': 'ㄍ', 'R': 'ㄐ', 'T': 'ㄔ', 'Y': 'ㄗ', 'U': 'ㄧ', 'I': 'ㄛ', 'O': 'ㄝ', 'P': 'ㄣ',
  'A': 'ㄇ', 'S': 'ㄋ', 'D': 'ㄎ', 'F': 'ㄑ', 'G': 'ㄒ', 'H': 'ㄘ', 'J': 'ㄨ', 'K': 'ㄜ', 'L': 'ㄠ',
  'Z': 'ㄈ', 'X': 'ㄌ', 'C': 'ㄏ', 'V': 'ㄒ', 'B': 'ㄖ', 'N': 'ㄙ', 'M': 'ㄩ'
};

export function RowView({
  chars, spacing = 5, keyWidth = 33
}: {
  chars: string
  spacing?: number
  keyWidth?: number
}) {
  // ⚡️ 效能優化：僅監聽必要的狀態
  const { lang, capsState } = selectStore(store => ({
    lang: store.lang,
    capsState: store.capsState
  }));

  const getChar = (c: string) => {
    if (lang === KeyboardLang.EN) {
      return capsState !== 0 ? c.toUpperCase() : c.toLowerCase();
    }
    return ZH_MAP[c] || c;
  };

  return <HStack spacing={spacing} alignment="center">
    {chars.split(' ').map((c, i) =>
      <KeyView
        key={`${lang}-${i}`}
        title={getChar(c)}
        minWidth={keyWidth}
        action={() => {
          CustomKeyboard.insertText(getChar(c));
        }}
      />
    )}
  </HStack>
}
