import { CustomKeyboard } from "scripting";
import { StoreProvider } from "./store";
import MainView from "./index";

async function main() {
  await CustomKeyboard.requestHeight(300);
  
  CustomKeyboard.present(
    <StoreProvider>
      <MainView />
    </StoreProvider>
  )
}

main();
