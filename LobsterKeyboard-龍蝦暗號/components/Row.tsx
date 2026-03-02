import { HStack, useContext } from "scripting";
import { KeyView } from "./Key";
import { StoreContext } from "../store";

declare const CustomKeyboard: any;

// 🧪 物理映射：中文注音
const ZH_MAP: Record<string, string> = {
  'Q': 'ㄅ', 'W': 'ㄉ', 'E': 'ˇ', 'R': 'ㄓ', 'T': 'ㄔ', 'Y': 'ㄕ', 'U': 'ㄖ', 'I': 'ㄗ', 'O': 'ㄘ', 'P': 'ㄙ',
  'A': 'ㄇ', 'S': 'ㄋ', 'D': 'ㄎ', 'F': 'ㄑ', 'G': 'ㄒ', 'H': 'ㄘ', 'J': 'ㄨ', 'K': 'ㄜ', 'L': 'ㄠ',
  'Z': 'ㄈ', 'X': 'ㄌ', 'C': 'ㄏ', 'V': 'ㄒ', 'B': 'ㄖ', 'N': 'ㄙ', 'M': 'ㄝ'
};

export function RowView({
  chars, spacing = 2
}: {
  chars: string
  spacing?: number
}) {
  const { lang, capsEnabled } = useContext(StoreContext) as any;

  const getChar = (c: string) => {
    if (lang === 0) {
      return capsEnabled ? c.toUpperCase() : c.toLowerCase();
    }
    return ZH_MAP[c] || c;
  };

  return <HStack spacing={spacing} alignment="center">
    {chars.split(' ').map((c, i) =>
      <KeyView
        key={i}
        title={getChar(c)}
        // 🧪 物理對位：字母鍵鎖定 38pt 飽滿寬度，背景設為 null 讓其採用 KeyView 預設白底
        minWidth={38}
        action={() => {
          CustomKeyboard.insertText(getChar(c));
        }}
      />
    )}
  </HStack>
}
