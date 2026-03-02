import { HStack } from "scripting";
import { KeyView } from "./Key";
import { selectStore, KeyboardLang } from "../store";

declare const CustomKeyboard: any;

/**
 * 🧪 v2.2.3 龍蝦標準注音映射 (iOS 18 / Standard PC Layout)
 * 修正聲調位置：聲調 ˇ ˊ ˙ 位於 Row 1，ˋ 位於 Row 3
 */
const ZH_MAP: Record<string, string> = {
  // Row 1: ㄅ ㄉ ˇ ㄓ ㄔ ˊ ˙ ㄚ ㄞ ㄢ (1 2 3 4 5 6 7 8 9 0)
  '1': 'ㄅ', '2': 'ㄉ', '3': 'ˇ', '4': 'ㄓ', '5': 'ㄔ', '6': 'ˊ', '7': '˙', '8': 'ㄚ', '9': 'ㄞ', '0': 'ㄢ',
  // Row 2: ㄆ ㄊ ㄍ ㄐ ㄘ ㄗ ㄧ ㄛ ㄝ ㄣ (Q..P)
  'Q': 'ㄆ', 'W': 'ㄊ', 'E': 'ㄍ', 'R': 'ㄐ', 'T': 'ㄘ', 'Y': 'ㄗ', 'U': 'ㄧ', 'I': 'ㄛ', 'O': 'ㄝ', 'P': 'ㄣ',
  // Row 3: ㄇ ㄋ ㄎ ㄑ ㄒ ㄓ ㄨ ㄜ ㄠ ㄡ (A..L) -> 加上 ; 為 ㄤ
  'A': 'ㄇ', 'S': 'ㄋ', 'D': 'ㄎ', 'F': 'ㄑ', 'G': 'ㄒ', 'H': 'ㄓ', 'J': 'ㄨ', 'K': 'ㄜ', 'L': 'ㄠ', ';': 'ㄤ',
  // Row 4: ㄈ ㄌ ㄏ ㄕ ㄖ ㄙ ㄩ ㄝ ㄡ ㄥ (Z..M) -> 加上標點符號與 ˋ 聲調
  'Z': 'ㄈ', 'X': 'ㄌ', 'C': 'ㄏ', 'V': 'ㄕ', 'B': 'ㄖ', 'N': 'ㄙ', 'M': 'ㄩ', ',': 'ㄝ', '.': 'ㄡ', '/': 'ㄥ', '\'': 'ˋ'
};

export function RowView({
  chars, spacing = 4, keyWidth = 35, fontSize
}: {
  chars: string
  spacing?: number
  keyWidth?: number
  fontSize?: number
}) {
  const { lang, capsState } = selectStore(store => ({
    lang: store.lang,
    capsState: store.capsState
  }));

  const processChar = (c: string) => {
    if (lang === KeyboardLang.EN && c.length === 1) {
      return capsState !== 0 ? c.toUpperCase() : c.toLowerCase();
    }
    return ZH_MAP[c] || c;
  };

  return <HStack spacing={spacing} alignment="center">
    {chars.split(' ').map((c, i) =>
      <KeyView
        key={`${lang}-${c}-${i}`}
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
