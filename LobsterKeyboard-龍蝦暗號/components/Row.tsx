import { HStack, useContext } from "scripting";
import { KeyView } from "./Key";
import { StoreContext, KeyboardLang } from "../store";

declare const CustomKeyboard: any;

// 鍵位映射表：[EN, ZH]
const KEY_MAP: Record<string, string> = {
  'Q': 'ㄅ', 'W': 'ㄉ', 'E': 'ˇ', 'R': 'ㄓ', 'T': 'ㄔ', 'Y': 'ㄕ', 'U': 'ㄖ', 'I': 'ㄗ', 'O': 'ㄘ', 'P': 'ㄙ',
  'A': 'ㄇ', 'S': 'ㄋ', 'D': 'ㄎ', 'F': 'ㄑ', 'G': 'ㄕ', 'H': 'ㄘ', 'J': 'ㄨ', 'K': 'ㄜ', 'L': 'ㄠ',
  'Z': 'ㄈ', 'X': 'ㄌ', 'C': 'ㄏ', 'V': 'ㄒ', 'B': 'ㄖ', 'N': 'ㄙ', 'M': 'ㄝ'
};

export function RowView({
  chars, spacing = 6
}: {
  chars: string
  spacing?: number
}) {
  const { lang, capsEnabled } = useContext(StoreContext);

  const getChar = (c: string) => {
    if (lang === KeyboardLang.EN) {
      return capsEnabled ? c.toUpperCase() : c.toLowerCase();
    }
    // 簡單注音映射 (示意)
    return KEY_MAP[c] || c;
  };

  return <HStack spacing={spacing}>
    {chars.split(' ').map((c, i) =>
      <KeyView
        key={i}
        title={getChar(c)}
        action={() => {
          CustomKeyboard.insertText(getChar(c));
        }}
      />
    )}
  </HStack>
}
