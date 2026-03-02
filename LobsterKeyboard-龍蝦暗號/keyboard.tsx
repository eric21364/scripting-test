import { CustomKeyboard } from "scripting";
import { StoreProvider } from "./src/store";
import MainView from "./src/views/MainView";

async function main() {
  await CustomKeyboard.requestHeight(300);
  
  CustomKeyboard.present(
    <StoreProvider>
      <MainView />
    </StoreProvider>
  )
}

main();
