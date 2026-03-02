import { HStack } from "scripting";
import { KeyView } from "./Key";
import { selectStore, KeyboardLang } from "../store";

declare const CustomKeyboard: any;

/**
 * 🧪 v2.2.4 龍蝦標準注音映射 (iOS 18 Native Baseline)
 * 修正聲調位置：ˋ 歸位至 ˇ 的右邊 (鍵位 4)
 * 修正注音不支援大小寫邏輯
 */
const ZH_MAP: Record<string, string> = {
  // Row 1: ㄅ ㄉ ˇ ˋ ㄓ ˊ ˙ ㄚ ㄞ ㄢ (1 2 3 4 5 6 7 8 9 0)
  '1': 'ㄅ', '2': 'ㄉ', '3': 'ˇ', '4': 'ˋ', '5': 'ㄓ', '6': 'ˊ', '7': '˙', '8': 'ㄚ', '9': 'ㄞ', '0': 'ㄢ',
  // Row 2: ㄆ ㄊ ㄍ ㄐ ㄔ ㄗ ㄧ ㄛ ㄝ ㄣ (Q W E R T Y U I O P)
  'Q': 'ㄆ', 'W': 'ㄊ', 'E': 'ㄍ', 'R': 'ㄐ', 'T': 'ㄔ', 'Y': 'ㄗ', 'U': 'ㄧ', 'I': 'ㄛ', 'O': 'ㄝ', 'P': 'ㄣ',
  // Row 3: ㄇ ㄋ ㄎ ㄑ ㄒ ㄕ ㄨ ㄜ ㄠ ㄡ ㄤ (A S D F G H J K L ;)
  'A': 'ㄇ', 'S': 'ㄋ', 'D': 'ㄎ', 'F': 'ㄑ', 'G': 'ㄒ', 'H': 'ㄕ', 'J': 'ㄨ', 'K': 'ㄜ', 'L': 'ㄠ', ';': 'ㄤ',
  // Row 4: ㄈ ㄌ ㄏ ㄖ ㄙ ㄩ ㄝ ㄡ ㄥ (Z X C V B N M , . /)
  'Z': 'ㄈ', 'X': 'ㄌ', 'C': 'ㄏ', 'V': 'ㄖ', 'B': 'ㄙ', 'N': 'ㄩ', 'M': 'ㄝ', ',': 'ㄡ', '.': 'ㄥ', '/': '/' 
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
    // 🛡️ 龍蝦準則：注音模式下無視 Caps 狀態，直接輸出映射字元
    if (lang === KeyboardLang.ZH) {
      return ZH_MAP[c] || c;
    }
    // EN 模式處理大小寫
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
