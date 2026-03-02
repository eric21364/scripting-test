import { HStack, useContext } from "scripting";
import { KeyView } from "./Key";
import { StoreContext } from "../store";

declare const CustomKeyboard: any;

// 🧪 物理映射：中文注音 (ㄅ-ㄙ)
const ZH_MAP: Record<string, string> = {
  'Q': 'ㄅ', 'W': 'ㄉ', 'E': 'ˇ', 'R': 'ㄓ', 'T': 'ㄔ', 'Y': 'ㄕ', 'U': 'ㄖ', 'I': 'ㄗ', 'O': 'ㄘ', 'P': 'ㄙ',
  'A': 'ㄇ', 'S': 'ㄋ', 'D': 'ㄎ', 'F': 'ㄑ', 'G': 'ㄒ', 'H': 'ㄘ', 'J': 'ㄨ', 'K': 'ㄜ', 'L': 'ㄠ',
  'Z': 'ㄈ', 'X': 'ㄌ', 'C': 'ㄏ', 'V': 'ㄒ', 'B': 'ㄖ', 'N': 'ㄙ', 'M': 'ㄝ'
};

export function RowView({
  chars, spacing = 2, keyWidth = 33
}: {
  chars: string
  spacing?: number
  keyWidth?: number
}) {
  const { lang, capsEnabled } = useContext(StoreContext) as any;

  const getChar = (c: string) => {
    // EN 模式
    if (lang === 0) {
      return capsEnabled ? c.toUpperCase() : c.toLowerCase();
    }
    // ZH 模式 (注音符號)
    return ZH_MAP[c] || c;
  };

  return <HStack spacing={spacing} alignment="center">
    {chars.split(' ').map((c, i) =>
      <KeyView
        key={i}
        title={getChar(c)}
        minWidth={keyWidth} // 🛡️ 物理鎖定：強制將寬度傳遞給子元件，防止坍塌成細條
        action={() => {
          CustomKeyboard.insertText(getChar(c));
        }}
      />
    )}
  </HStack>
}
