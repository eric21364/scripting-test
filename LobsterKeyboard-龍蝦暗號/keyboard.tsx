declare const CustomKeyboard: any;
import { StoreProvider } from "./store";
import MainView from "./index";

async function main() {
  // 🧪 物理標校：V2 標準高度 260pt，解決佈局擠壓
  await CustomKeyboard.requestHeight(260);
  
  CustomKeyboard.present(
    <StoreProvider>
      <MainView />
    </StoreProvider>
  )
}

main();
