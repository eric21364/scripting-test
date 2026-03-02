import { HStack, useContext } from "scripting";
import { KeyView } from "./Key";
import { StoreContext } from "../store";

declare const CustomKeyboard: any;

export function RowView({
  chars, spacing = 6
}: {
  chars: string
  spacing?: number
}) {
  const {
    capsEnabled,
  } = useContext(StoreContext);

  return <HStack spacing={spacing}>
    {chars.split(' ').map((c, i) =>
      <KeyView
        key={i}
        title={capsEnabled ? c.toUpperCase() : c.toLowerCase()}
        action={() => {
          CustomKeyboard.insertText(capsEnabled ? c.toUpperCase() : c.toLowerCase());
        }}
      />
    )}
  </HStack>
}
