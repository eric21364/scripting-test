declare const CustomKeyboard: any;
import { StoreProvider } from "./store";
import MainView from "./index";

async function main() {
  // 🧪 物理標校：回歸 v2.0.4 緊湊高度 240pt
  await CustomKeyboard.requestHeight(240);
  
  CustomKeyboard.present(
    <StoreProvider>
      <MainView />
    </StoreProvider>
  )
}

main();
