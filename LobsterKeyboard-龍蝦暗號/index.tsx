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
 * 龍蝦暗號 v2.2.2 [iOS 18 標準佈局 + v2.0.4 物理美學]
 * 解決刪除按鈕消失、物理範圍過小、注音排列誤差問題
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
      
      {/* 🚀 v2.0.4 重心標校：Spacer 置頂，將內容壓低 */}
      <Spacer />

      {/* 🔮 龍蝦互動列 */}
      <HStack padding={{ horizontal: 16 }} frame={{ height: 32 }} background={TOOLBAR_BG}>
        <Image systemName="shield.lefthalf.filled" font={{ size: 12, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 10, name: "system-bold" }} padding={{ leading: 4 }}>龍蝦標校 v2.2.2</Text>
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

      <VStack spacing={4} padding={{ top: 4, leading: 2, trailing: 2, bottom: 6 }} frame={{ maxWidth: "infinity" }}>
        {mode === KeyboardMode.Standard ? (
          /* 🅰️ iOS 18 標準注音/英文佈局複刻 */
          <VStack spacing={4} alignment="center">
            
            {/* ROW 1: ㄅ..ㄎ (ZH) / 1..0 (EN/Numbers) */}
            <RowView 
              chars={lang === KeyboardLang.ZH ? "ㄅ ㄆ ㄇ ㄈ ㄉ ㄊ ㄋ ㄌ ㄍ ㄎ" : "1 2 3 4 5 6 7 8 9 0"} 
              spacing={3} keyWidth={35} 
            />

            {/* ROW 2: ㄏ..ㄘ (ZH) / Q..P (EN) */}
            <RowView 
              chars={lang === KeyboardLang.ZH ? "ㄏ ㄐ ㄑ ㄒ ㄓ ㄔ ㄕ ㄖ ㄗ ㄘ" : "Q W E R T Y U I O P"} 
              spacing={3} keyWidth={35} 
            />

            {/* ROW 3: ㄙ..ㄢ (ZH) / A..L (EN) */}
            <HStack spacing={3} alignment="center">
                {lang === KeyboardLang.EN ? <Spacer /> : null}
                <RowView 
                  chars={lang === KeyboardLang.ZH ? "ㄙ ㄚ ㄛ ㄜ ㄝ ㄞ ㄟ ㄠ ㄡ ㄢ" : "A S D F G H J K L"} 
                  spacing={3} keyWidth={35} 
                />
                {lang === KeyboardLang.EN ? <Spacer /> : null}
            </HStack>
            
            {/* ROW 4: (Shift) + ㄣ..ˋ + (Backspace) */}
            <HStack spacing={3} alignment="center">
              <KeyView 
                title={capsState === CapsState.Locked ? "🔒" : "⇧"} 
                minWidth={lang === KeyboardLang.ZH ? 33 : 44} 
                height={38} 
                functional
                action={() => setCapsState(capsState === CapsState.Off ? CapsState.On : CapsState.Off)} 
                onTapGesture={{ count: 2, perform: () => { setCapsState(CapsState.Locked); HapticFeedback.lightImpact(); } }}
                background={capsState !== CapsState.Off ? "white" : FUNCTIONAL_GRAY} 
                foregroundStyle={capsState !== CapsState.Off ? "#007AFF" : "black"} 
              />
              <RowView 
                chars={lang === KeyboardLang.ZH ? "ㄣ ㄤ ㄥ ㄦ ㄧ ㄨ ㄩ ˙ ˊ ˇ ˋ" : "Z X C V B N M"} 
                spacing={3} 
                keyWidth={lang === KeyboardLang.ZH ? 23 : 35} 
                fontSize={lang === KeyboardLang.ZH ? 14 : 17}
              />
              <KeyView title="⌫" minWidth={lang === KeyboardLang.ZH ? 33 : 44} height={38} functional action={() => CustomKeyboard.deleteBackward()} />
            </HStack>
            
            {/* ROW 5: 控制列 */}
            <HStack spacing={6} alignment="center">
              <KeyView title="123" minWidth={44} height={38} functional />
              <KeyView title={lang === KeyboardLang.ZH ? "中" : "EN"} minWidth={44} height={38} functional action={() => setLang(lang === KeyboardLang.ZH ? KeyboardLang.EN : KeyboardLang.ZH)} />
              <KeyView title="space" wide={true} minWidth={180} height={38} action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="換行" minWidth={64} height={38} functional fontSize={13} action={() => CustomKeyboard.insertText("\n")} />
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工面板 */
          <VStack spacing={12} padding={10}>
            <HStack spacing={15}>
               <KeyView title="🦞 隱入塵煙" action={handleEncode} wide={true} minWidth={170} background="rgba(255, 69, 0, 0.2)" foregroundStyle="systemOrange" height={55} />
               <KeyView title="打字模式" action={() => setMode(KeyboardMode.Standard)} wide={true} minWidth={170} background={FUNCTIONAL_GRAY} height={55} />
            </HStack>
            <View frame={{ maxWidth: "infinity", height: 70 }} background="white" clipShape={{ type: 'rect', cornerRadius: 10 }}>
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
