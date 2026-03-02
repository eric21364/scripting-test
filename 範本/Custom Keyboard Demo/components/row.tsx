import { HStack, useContext } from "scripting"
import { KeyView } from "./key"
import { CapsState, StoreContext } from "../store"

export function RowView({
  chars
}: {
  chars: string
}) {
  const {
    capsEnabled,
    capsLocked,
    setCapsState,
  } = useContext(StoreContext)

  return <HStack spacing={6}>
    {chars.split(' ').map((c, i) =>
      <KeyView
        key={i}
        title={capsEnabled ? c.toUpperCase() : c.toLowerCase()}
        action={() => {
          console.log(`Key ${c} pressed`)
          CustomKeyboard.insertText(capsEnabled ? c.toUpperCase() : c.toLowerCase())
          if (capsEnabled && !capsLocked) {
            setCapsState(CapsState.Off)
          }
          HapticFeedback.lightImpact()
        }}
      />
    )}
  </HStack>
}