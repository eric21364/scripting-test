import { HStack } from "scripting";
import { KeyView } from "./Key";
import { selectStore, KeyboardLang } from "../store";

declare const CustomKeyboard: any;

/**
 * 🧪 v2.2.2 靈活 RowView
 * 支援根據傳入的字串陣列直接渲染，簡化佈局逻辑
 */
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
    return c;
  };

  return <HStack spacing={spacing} alignment="center">
    {chars.split(' ').map((c, i) =>
      <KeyView
        key={`${i}-${c}`}
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
