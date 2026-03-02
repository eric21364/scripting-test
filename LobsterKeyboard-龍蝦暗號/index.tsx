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
 * 龍蝦暗號 v2.2.0 [物理質感與原生佈局補正版]
 * 回歸 v2.0.4 ZStack 按鍵美學，並同步 iOS 18 注音 1:1 版型
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

  // iOS 標準物理背景配色 (回歸 2.0.4 立體氛圍)
  const KEYBOARD_BG = "rgba(210, 213, 220, 1)"; 

  return (
    <VStack spacing={0} background={KEYBOARD_BG} frame={{ maxWidth: "infinity", height: 260 }}>
      
      <Spacer />

      {/* 🔮 龍蝦互動列 */}
      <HStack padding={{ horizontal: 16 }} frame={{ height: 26 }} background="rgba(210, 213, 220, 0.4)">
        <Image systemName="shield.lefthalf.filled" font={{ size: 12, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 9 }} padding={{ leading: 4 }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        <Button action={() => {
           setMode(mode === KeyboardMode.Standard ? KeyboardMode.Agent : KeyboardMode.Standard);
           HapticFeedback.lightImpact();
        }} buttonStyle="plain">
          <ZStack background={mode === KeyboardMode.Standard ? "rgba(255,255,255,0.7)" : "systemOrange"} clipShape={{type:'rect', cornerRadius: 5}} padding={{horizontal: 7, vertical: 3}}>
             <Text font={{ size: 9, name: "system-bold" }} foregroundStyle={mode === KeyboardMode.Standard ? "label" : "white"}>
               {mode === KeyboardMode.Standard ? "AGENT" : "TYPING"}
             </Text>
          </ZStack>
        </Button>
      </HStack>

      {/* ⌨️ 物理盤面對位 */}
      <VStack spacing={6} padding={{ top: 2, leading: 4, trailing: 4, bottom: 6 }} frame={{ maxWidth: "infinity" }}>
        {mode === KeyboardMode.Standard ? (
          <VStack spacing={6} alignment="center">
            
            {/* ROW 1: 數字常駐排 (1-0) */}
            <RowView chars="1 2 3 4 5 6 7 8 9 0" spacing={5} keyWidth={32} />

            {/* ROW 2: (ZH) ㄅ-ㄎ / (EN) Q..P */}
            <RowView chars="Q W E R T Y U I O P" spacing={5} keyWidth={32} />

            {/* ROW 3: (ZH) ㄏ-ㄢ / (EN) A..L */}
            <HStack spacing={5} alignment="center">
                {lang === KeyboardLang.EN ? <Spacer /> : null}
                <RowView chars={lang === KeyboardLang.ZH ? "A S D F G H J K L ;" : "A S D F G H J K L"} spacing={5} keyWidth={32} />
                {lang === KeyboardLang.EN ? <Spacer /> : null}
            </HStack>
            
            {/* ROW 4: Shift 排對位 */}
            <HStack spacing={lang === KeyboardLang.ZH ? 4 : 5} alignment="center">
              <KeyView 
                title={capsState === CapsState.Locked ? "🔒" : "⇧"} 
                minWidth={lang === KeyboardLang.ZH ? 33 : 42} 
                height={42} 
                functional
                action={() => setCapsState(capsState === CapsState.Off ? CapsState.On : CapsState.Off)} 
                onTapGesture={{ count: 2, perform: () => { setCapsState(CapsState.Locked); HapticFeedback.lightImpact(); } }}
                foregroundStyle={capsState !== CapsState.Off ? "systemBlue" : "label"} 
              />
              <RowView chars={lang === KeyboardLang.ZH ? "Z X C V B N M , . / '" : "Z X C V B N M"} spacing={lang === KeyboardLang.ZH ? 4 : 5} keyWidth={lang === KeyboardLang.ZH ? 22 : 32} />
              <KeyView title="⌫" minWidth={lang === KeyboardLang.ZH ? 33 : 42} height={42} functional action={() => CustomKeyboard.deleteBackward()} />
            </HStack>
            
            {/* ROW 5: 控制列對位 (123 / Lang / Space / Return) */}
            <HStack spacing={6} alignment="center">
              <KeyView title="123" minWidth={44} height={42} functional />
              <KeyView title={lang === KeyboardLang.ZH ? "中" : "EN"} minWidth={44} height={42} functional action={() => setLang(lang === KeyboardLang.ZH ? KeyboardLang.EN : KeyboardLang.ZH)} />
              <KeyView title="space" wide={true} minWidth={160} height={42} background="rgba(255,255,255,1)" action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="換行" minWidth={70} height={42} functional fontSize={14} action={() => CustomKeyboard.insertText("\n")} />
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工模式 */
          <VStack spacing={12} padding={10}>
            <HStack spacing={15}>
               <KeyView title="隱入塵煙" action={handleEncode} wide={true} minWidth={170} background="rgba(255, 69, 0, 0.1)" foregroundStyle="systemOrange" height={60} />
               <KeyView title="清除內容" action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } setDecodedContent(""); }} wide={true} minWidth={170} background="rgba(172, 179, 187, 0.5)" foregroundStyle="red" height={60} />
            </HStack>
            <View frame={{ maxWidth: "infinity", height: 80 }} background="rgba(255,255,255,0.9)" clipShape={{ type: 'rect', cornerRadius: 10 }}>
              {decodedContent ? (
                <ScrollView padding={12}>
                  <Text font={{ size: 14, name: "system" }} foregroundStyle="label">{decodedContent}</Text>
                </ScrollView>
              ) : (
                <VStack alignment="center" opacity={0.3} frame={{maxWidth:"infinity", maxHeight:"infinity"}}>
                  <Image systemName="waveform.and.magnifyingglass" font={{ size: 32, name: "system" }} foregroundStyle="label" />
                </VStack>
              )}
            </View>
            <HStack alignment="center">
               <KeyView title="返回打字模式" action={() => setMode(KeyboardMode.Standard)} wide={true} minWidth={350} background="rgba(172, 179, 187, 0.5)" height={44} />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
