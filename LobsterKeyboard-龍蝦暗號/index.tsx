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
 * 龍蝦暗號 v2.2.3 [v2.0.4 佈局歸位 + 聲調修正版]
 * 完全複刻 v2.0.4 重心與位置，修正注音聲調至 Row 1
 */
export default function MainView() {
  const { mode, setMode } = selectStore(s => ({ mode: s.mode, setMode: s.setMode }));
  const { lang, setLang } = selectStore(s => ({ lang: s.lang, setLang: s.setLang }));
  const { capsState, setCapsState } = selectStore(s => ({ capsState: s.capsState, setCapsState: s.setCapsState }));
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

  const KEYBOARD_BG = "#828A91"; 
  const TOOLBAR_BG = "rgba(240, 242, 245, 0.9)";
  const FUNCTIONAL_GRAY = "rgba(171, 177, 182, 1)";

  return (
    <VStack spacing={0} background={KEYBOARD_BG} frame={{ maxWidth: "infinity", height: 240 }}>
      
      {/* 🚀 v2.0.4 標誌：頂部 Spacer 壓低重心 */}
      <Spacer />

      {/* 🔮 龍蝦 Toolbar */}
      <HStack padding={{ horizontal: 16 }} frame={{ height: 34 }} background={TOOLBAR_BG}>
        <Image systemName="shield.lefthalf.filled" font={{ size: 12, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 11, name: "system-bold" }} padding={{ leading: 4 }}>龍蝦標校 v2.2.3</Text>
        <Spacer />
        <Text font={{ size: 9 }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        <Button action={() => {
           setMode(mode === KeyboardMode.Standard ? KeyboardMode.Agent : KeyboardMode.Standard);
           HapticFeedback.lightImpact();
        }} buttonStyle="plain">
          <ZStack background={mode === KeyboardMode.Standard ? "rgba(0,0,0,0.05)" : "systemOrange"} clipShape={{type:'rect', cornerRadius: 6}} padding={{horizontal: 10, vertical: 4}}>
             <Text font={{ size: 9, name: "system-bold" }} foregroundStyle={mode === KeyboardMode.Standard ? "black" : "white"}>
               {mode === KeyboardMode.Standard ? "特工" : "打字"}
             </Text>
          </ZStack>
        </Button>
      </HStack>

      <VStack spacing={4} padding={{ top: 4, leading: 6, trailing: 6, bottom: 6 }} frame={{ maxWidth: "infinity" }}>
        {mode === KeyboardMode.Standard ? (
          /* 🅰️ v2.0.4 核心架構複刻 */
          <VStack spacing={4} alignment="center">
            
            {/* ROW 1: ㄅ..ㄢ (含聲調 ˇ ˊ ˙) */}
            <RowView chars="1 2 3 4 5 6 7 8 9 0" spacing={4} keyWidth={35} />

            {/* ROW 2: ㄆ..ㄣ (Q..P) */}
            <RowView chars="Q W E R T Y U I O P" spacing={4} keyWidth={35} />

            {/* ROW 3: ㄇ..ㄤ (A..;) */}
            <RowView chars={lang === KeyboardLang.ZH ? "A S D F G H J K L ;" : "A S D F G H J K L"} spacing={4} keyWidth={35} />
            
            {/* ROW 4: Shift + ㄈ..ㄥ + ⌫ */}
            <HStack spacing={4} alignment="center">
              <KeyView 
                title="⇧" 
                minWidth={44} 
                height={40} 
                functional
                action={() => setCapsState(capsState === CapsState.Off ? CapsState.On : CapsState.Off)} 
                onTapGesture={{ count: 2, perform: () => { setCapsState(CapsState.Locked); HapticFeedback.lightImpact(); } }}
                background={capsState !== CapsState.Off ? "white" : FUNCTIONAL_GRAY} 
                foregroundStyle={capsState !== CapsState.Off ? "#007AFF" : "black"} 
              />
              <RowView chars={lang === KeyboardLang.ZH ? "Z X C V B N M ' , . /" : "Z X C V B N M"} spacing={4} keyWidth={lang === KeyboardLang.ZH ? 25 : 35} />
              <KeyView title="⌫" minWidth={44} height={40} functional background={FUNCTIONAL_GRAY} action={() => CustomKeyboard.deleteBackward()} />
            </HStack>
            
            {/* ROW 5: 控制排 */}
            <HStack spacing={6} alignment="center">
              <KeyView title={lang === KeyboardLang.ZH ? "中" : "EN"} minWidth={54} height={40} background={FUNCTIONAL_GRAY} action={() => setLang(lang === KeyboardLang.ZH ? KeyboardLang.EN : KeyboardLang.ZH)} />
              <KeyView title="space" wide={true} minWidth={185} height={40} action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="換行" minWidth={64} height={40} background={FUNCTIONAL_GRAY} fontSize={13} action={() => CustomKeyboard.insertText("\n")} />
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工面板 */
          <VStack spacing={12} padding={10}>
             <HStack spacing={15}>
               <KeyView title="🦞 隱入塵煙" action={handleEncode} wide={true} minWidth={170} background="rgba(255, 69, 0, 0.2)" foregroundStyle="systemOrange" height={55} />
               <KeyView title="打字模式" action={() => setMode(KeyboardMode.Standard)} wide={true} minWidth={170} background={FUNCTIONAL_GRAY} height={55} />
            </HStack>
            <ZStack background="white" clipShape={{ type: 'rect', cornerRadius: 10 }} frame={{ maxWidth: "infinity", height: 70 }}>
              {decodedContent ? (
                <ScrollView padding={10}><Text font={{ size: 14, name: "system" }}>{decodedContent}</Text></ScrollView>
              ) : (
                <VStack alignment="center" opacity={0.2} frame={{maxWidth:"infinity", maxHeight:"infinity"}}>
                  <Image systemName="waveform" font={{ size: 28, name: "system" }} />
                </VStack>
              )}
            </ZStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
