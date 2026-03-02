declare const CustomKeyboard: any;
import { StoreProvider } from "./store";
import MainView from "./index";

async function main() {
  await CustomKeyboard.requestHeight(216);
  
  CustomKeyboard.present(
    <StoreProvider>
      <MainView />
    </StoreProvider>
  )
}

main();
