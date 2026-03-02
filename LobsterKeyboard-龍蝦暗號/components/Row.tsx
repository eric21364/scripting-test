import { HStack } from "scripting";
import { KeyView } from "./Key";
import { selectStore, KeyboardLang } from "../store";

declare const CustomKeyboard: any;

/**
 * 🧪 龍蝦標準注音映射 (Windows Standard/iOS Layout)
 * 完全校準聲母、韻母與聲調 (˙ˊˇˋ)
 */
const ZH_MAP: Record<string, string> = {
  '1': 'ㄅ', '2': 'ㄆ', '3': 'ㄇ', '4': 'ㄈ', '5': 'ㄉ', '6': 'ㄊ', '7': 'ㄋ', '8': 'ㄌ', '9': 'ㄍ', '0': 'ㄎ',
  'Q': 'ㄏ', 'W': 'ㄐ', 'E': 'ㄑ', 'R': 'ㄒ', 'T': 'ㄓ', 'Y': 'ㄔ', 'U': 'ㄕ', 'I': 'ㄖ', 'O': 'ㄗ', 'P': 'ㄘ',
  'A': 'ㄙ', 'S': 'ㄚ', 'D': 'ㄛ', 'F': 'ㄜ', 'G': 'ㄝ', 'H': 'ㄞ', 'J': 'ㄟ', 'K': 'ㄠ', 'L': 'ㄡ', ';': 'ㄢ',
  'Z': 'ㄣ', 'X': 'ㄤ', 'C': 'ㄥ', 'V': 'ㄦ', 'B': 'ㄧ', 'N': 'ㄨ', 'M': 'ㄩ', ',': '˙', '.': 'ˊ', '/': 'ˇ', '\'': 'ˋ'
};

export function RowView({
  chars, spacing = 5, keyWidth = 33
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
      if (c.length > 1) return c; // space, 換行等標記
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
