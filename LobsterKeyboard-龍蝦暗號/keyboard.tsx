declare const CustomKeyboard: any;
import { StoreProvider } from "./store";
import MainView from "./index";

async function main() {
  // 🧪 物理標校：回歸 v2.0.4 立體美學，高度適配 260pt
  await CustomKeyboard.requestHeight(260);
  
  CustomKeyboard.present(
    <StoreProvider>
      <MainView />
    </StoreProvider>
  )
}

main();
