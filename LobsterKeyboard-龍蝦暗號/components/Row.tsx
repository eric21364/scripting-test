import { HStack } from "scripting";
import { KeyView } from "./Key";
import { selectStore, KeyboardLang } from "../store";

declare const CustomKeyboard: any;

/**
 * 🧪 龍蝦標準注音映射 (PC/QWERTY Standard)
 * v2.2.1 [注音聲符全對位補完]
 */
const ZH_MAP: Record<string, string> = {
  // 注音ㄅ..ㄎ (含數字排)
  '1': 'ㄅ', '2': 'ㄉ', '3': 'ˇ', '4': 'ㄓ', '5': 'ㄔ', '6': 'ㄗ', '7': '˙', '8': 'ㄚ', '9': 'ㄞ', '0': 'ㄢ',
  // QWERTY 第一排 (ㄅ..ㄙ、聲符)
  'Q': 'ㄆ', 'W': 'ㄊ', 'E': 'ㄍ', 'R': 'ㄐ', 'T': 'ㄘ', 'Y': 'ㄙ', 'U': 'ㄧ', 'I': 'ㄛ', 'O': 'ㄝ', 'P': 'ㄣ',
  // QWERTY 第二排 (ㄇ..ㄠ、ㄤ)
  'A': 'ㄇ', 'S': 'ㄋ', 'D': 'ㄎ', 'F': 'ㄑ', 'G': 'ㄒ', 'H': 'ㄖ', 'J': 'ㄨ', 'K': 'ㄜ', 'L': 'ㄠ', ';': 'ㄤ',
  // QWERTY 第三排 (ㄈ..ㄩ、聲調)
  'Z': 'ㄈ', 'X': 'ㄌ', 'C': 'ㄏ', 'V': 'ㄒ', 'B': 'ㄕ', 'N': 'ㄙ', 'M': 'ㄩ', ',': 'ㄝ', '.': 'ㄡ', '/': 'ㄥ', '\'': 'ˋ'
};

export function RowView({
  chars, spacing = 5, keyWidth = 35
}: {
  chars: string
  spacing?: number
  keyWidth?: number
}) {
  const { lang, capsState } = selectStore(store => ({
    lang: store.lang,
    capsState: store.capsState
  }));

  const getChar = (c: string) => {
    if (lang === KeyboardLang.EN) {
      if (c.length > 1) return c; 
      return capsState !== 0 ? c.toUpperCase() : c.toLowerCase();
    }
    return ZH_MAP[c] || c;
  };

  return <HStack spacing={spacing} alignment="center">
    {chars.split(' ').map((c, i) =>
      <KeyView
        key={`${lang}-${i}-${c}`}
        title={getChar(c)}
        minWidth={keyWidth}
        action={() => {
          CustomKeyboard.insertText(getChar(c));
        }}
      />
    )}
  </HStack>
}
