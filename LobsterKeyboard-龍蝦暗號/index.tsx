import {
  Text,
  HStack,
  VStack,
  Button,
  Spacer,
  Image,
  ZStack,
  ScrollView,
  HapticFeedback
} from "scripting";

// @ts-ignore
import { selectStore, KeyboardMode, KeyboardLang, CapsState } from "./store";
// @ts-ignore
import { KeyView } from "./components/Key";
// @ts-ignore
import { RowView } from "./components/Row";
// @ts-ignore
import { encode, decode, MARKER } from "./utils/cipher";

declare const CustomKeyboard: any;
declare const Pasteboard: any;
declare const Clipboard: any;

/**
 * 龍蝦暗號 v2.2.6 [符號模式與連續刪除支援]
 * 支援 123 符號鍵切換，刪除鍵長按可批量移除
 */
export default function MainView() {
  const { mode, setMode } = selectStore(s => ({ mode: s.mode, setMode: s.setMode }));
  const { lang, setLang } = selectStore(s => ({ lang: s.lang, setLang: s.setLang }));
  const { capsState, setCapsState } = selectStore(s => ({ capsState: s.capsState, setCapsState: s.setCapsState }));
  const { isSymbols, setIsSymbols } = selectStore(s => ({ isSymbols: s.isSymbols, setIsSymbols: s.setIsSymbols }));
  const { debugMsg, setDebugMsg } = selectStore(s => ({ debugMsg: s.debugMsg, setDebugMsg: s.setDebugMsg }));
  const { decodedContent, setDecodedContent } = selectStore(s => ({ decodedContent: s.decodedContent, setDecodedContent: s.setDecodedContent }));

  const handleEncode = () => {
    const currentText = CustomKeyboard.allText || "";
    if (!currentText) { setDebugMsg("無內容隱入"); HapticFeedback.lightImpact(); return; }
    const cipher = encode(currentText);
    const deleteCount = currentText.length;
    for(let i = 0; i < deleteCount; i++) { CustomKeyboard.deleteBackward(); }
    CustomKeyboard.insertText(cipher);
    setDebugMsg("暗號就緒 🦞");
    HapticFeedback.lightImpact();
  };

  const handleContinuousDelete = () => {
    // 🧪 物理連發：長按一次刪除 8 個字元 (類比連發效果)
    for(let i = 0; i < 8; i++) {
        if (CustomKeyboard.hasText) CustomKeyboard.deleteBackward();
    }
    HapticFeedback.notification("warning");
  };

  const KEYBOARD_BG = "#828A91"; 
  const TOOLBAR_BG = "rgba(240, 242, 245, 0.9)";
  const FUNCTIONAL_GRAY = "rgba(171, 177, 182, 1)";

  return (
    <VStack spacing={0} background={KEYBOARD_BG} frame={{ maxWidth: "infinity", height: 240 }}>
      
      <Spacer />

      {/* 🔮 龍蝦互動列 */}
      <HStack padding={{ horizontal: 16 }} frame={{ height: 32 }} background={TOOLBAR_BG}>
        <Image systemName="shield.lefthalf.filled" font={{ size: 12, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 10, name: "system-bold" }} padding={{ leading: 4 }}>龍蝦標校 v2.2.6</Text>
        <Spacer />
        <Text font={{ size: 8 }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        <Button action={() => {
           setMode(mode === KeyboardMode.Standard ? KeyboardMode.Agent : KeyboardMode.Standard);
           HapticFeedback.lightImpact();
        }} buttonStyle="plain">
          <ZStack background={mode === KeyboardMode.Standard ? "rgba(0,0,0,0.05)" : "systemOrange"} clipShape={{type:'rect', cornerRadius: 5}} padding={{horizontal: 8, vertical: 3}}>
             <Text font={{ size: 9, name: "system-bold" }} foregroundStyle={mode === KeyboardMode.Standard ? "black" : "white"}>
               {mode === KeyboardMode.Standard ? (isSymbols ? "SYM" : "特工") : "打字"}
             </Text>
          </ZStack>
        </Button>
      </HStack>

      <VStack spacing={4} padding={{ top: 2, leading: 6, trailing: 6, bottom: 6 }} frame={{ maxWidth: "infinity" }}>
        {mode === KeyboardMode.Standard ? (
          <VStack spacing={4} alignment="center">
            
            {/* ROW 1: ㄅ..ㄢ / 1..0 / [..= */}
            <RowView chars="1 2 3 4 5 6 7 8 9 0" spacing={4} keyWidth={35} />

            {/* ROW 2: ㄆ..ㄣ / Q..P / -.." */}
            <RowView chars="Q W E R T Y U I O P" spacing={4} keyWidth={35} />

            {/* ROW 3: ㄇ..ㄤ / A..L / ...` */}
            <RowView chars={lang === KeyboardLang.ZH ? "A S D F G H J K L ;" : "A S D F G H J K L"} spacing={4} keyWidth={35} />
            
            {/* ROW 4: Shift/Symbols + (ㄈ..ㄥ / Z..M) + Delete */}
            <HStack spacing={4} alignment="center">
              {lang === KeyboardLang.EN || isSymbols ? (
                <KeyView 
                  title={isSymbols ? "#+=" : (capsState === CapsState.Locked ? "🔒" : "⇧")} 
                  minWidth={44} 
                  height={40} 
                  functional
                  action={() => {
                      if (isSymbols) {
                        // 符號分頁切換 (未來擴充)
                      } else {
                        setCapsState(capsState === CapsState.Off ? CapsState.On : CapsState.Off);
                      }
                  }} 
                  onTapGesture={!isSymbols ? { count: 2, perform: () => { setCapsState(CapsState.Locked); HapticFeedback.lightImpact(); } } : undefined}
                  background={(!isSymbols && capsState !== CapsState.Off) ? "white" : FUNCTIONAL_GRAY} 
                  foregroundStyle={(!isSymbols && capsState !== CapsState.Off) ? "#007AFF" : "black"} 
                />
              ) : (
                <Spacer />
              )}
              
              <RowView chars={(!isSymbols && lang === KeyboardLang.ZH) ? "Z X C V B N M , ." : "Z X C V B N M"} spacing={4} keyWidth={35} />
              
              <KeyView 
                title="⌫" 
                minWidth={lang === KeyboardLang.ZH && !isSymbols ? 54 : 44} 
                height={40} 
                functional 
                background={FUNCTIONAL_GRAY} 
                action={() => CustomKeyboard.deleteBackward()} 
                onLongPressGesture={handleContinuousDelete}
              />
            </HStack>
            
            {/* ROW 5: 控制列 */}
            <HStack spacing={6} alignment="center">
              <KeyView 
                title={isSymbols ? "ABC" : "123"} 
                minWidth={54} height={40} functional background={FUNCTIONAL_GRAY} 
                action={() => setIsSymbols(!isSymbols)} 
              />
              <KeyView title={lang === KeyboardLang.ZH ? "中" : "EN"} minWidth={44} height={40} functional background={FUNCTIONAL_GRAY} action={() => setLang(lang === KeyboardLang.ZH ? KeyboardLang.EN : KeyboardLang.ZH)} />
              <KeyView title="space" wide={true} minWidth={150} height={40} action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="換行" minWidth={64} height={40} background={FUNCTIONAL_GRAY} fontSize={13} action={() => CustomKeyboard.insertText("\n")} />
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工面板 */
          <VStack spacing={12} padding={10}>
             <HStack spacing={15}>
               <KeyView title="隱入塵煙" action={handleEncode} wide={true} minWidth={170} background="rgba(255, 69, 0, 0.15)" foregroundStyle="systemOrange" height={55} />
               <KeyView title="打字模式" action={() => setMode(KeyboardMode.Standard)} wide={true} minWidth={170} background={FUNCTIONAL_GRAY} height={55} />
            </HStack>
            <View frame={{ maxWidth: "infinity", height: 75 }} background="white" clipShape={{ type: 'rect', cornerRadius: 10 }}>
              {decodedContent ? (
                <ScrollView padding={10}><Text font={{ size: 14, name: "system" }}>{decodedContent}</Text></ScrollView>
              ) : (
                <VStack alignment="center" opacity={0.2} frame={{maxWidth:"infinity", maxHeight:"infinity"}}>
                  <Image systemName="waveform" font={{ size: 28, name: "system" }} />
                </VStack>
              )}
            </View>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
