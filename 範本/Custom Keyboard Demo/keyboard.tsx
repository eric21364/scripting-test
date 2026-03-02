import { HStack, VStack } from "scripting"
import { RowView } from "./components/row"
import { KeyView } from "./components/key"
import { CapsState, selectStore, StoreProvider } from "./store"

function KeyboardView() {

  const {
    capsState,
    setCapsState
  } = selectStore(store => ({
    capsState: store.capsState,
    setCapsState: store.setCapsState,
  }))

  return <VStack
    spacing={6}
    padding={8}
  >
    <RowView
      chars={"Q W E R T Y U I O P"}
    />
    <RowView
      chars={"A S D F G H J K L"}
    />
    <HStack spacing={6}>
      <KeyView
        title={"⇪"}
        action={() => {
          if (capsState === CapsState.Off) {
            setCapsState(CapsState.On)
          } else {
            setCapsState(CapsState.Off)
          }
          HapticFeedback.lightImpact()
        }}
        onTapGesture={{
          count: 2,
          perform: () => {
            setCapsState(CapsState.Locked)
            HapticFeedback.lightImpact()
          }
        }}
      />
      <RowView
        chars={"Z X C V B N M"}
      />
      <KeyView
        title={"⌫"}
        wide
        action={() => {
          console.log("Backspace pressed")
          CustomKeyboard.deleteBackward()
          HapticFeedback.lightImpact()
        }}
      />
    </HStack>
    <HStack spacing={6}>
      <KeyView
        title="Space"
        wide
        action={() => {
          console.log("Space pressed")
          CustomKeyboard.insertText(" ")
          HapticFeedback.lightImpact()
        }}
      />
      <KeyView
        title="⏎"
        wide
        action={() => {
          console.log("Return pressed")
          CustomKeyboard.insertText("\n")
          HapticFeedback.lightImpact()
        }}
      />
    </HStack>
  </VStack>
}

async function main() {
  await Promise.all([
    // Hide the default toolbar
    // CustomKeyboard.setToolbarVisible(false),
    CustomKeyboard.requestHeight(260),
  ])
  
  CustomKeyboard.present(
    <StoreProvider>
      <KeyboardView />
    </StoreProvider>
  )
}

main()