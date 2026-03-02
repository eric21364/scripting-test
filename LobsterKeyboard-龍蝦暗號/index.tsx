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
 * 龍蝦暗號 v2.1.5 [物理巔峰標校：注音四排對位版]
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

  const handleDecode = async () => {
    let clip: string | null = null;
    try { clip = await (typeof Pasteboard !== 'undefined' ? Pasteboard.getString() : Clipboard.getString()); } catch (e) {}
    if (!clip || !clip.includes(MARKER)) { setDebugMsg("未發現暗號"); HapticFeedback.lightImpact(); return; }
    const result = decode(clip);
    setDecodedContent(result);
    setDebugMsg("解碼完成 👁️");
    HapticFeedback.lightImpact();
  };

  const KEYBOARD_BG = "rgba(209, 212, 218, 1)"; 

  return (
    <VStack spacing={0} background={KEYBOARD_BG} frame={{ maxWidth: "infinity", height: 260 }}>
      
      {/* 🚀 物理對位：重心下移，確保按鍵位於螢幕底邊 */}
      <Spacer />

      {/* 🔮 龍蝦 Toolbar */}
      <HStack padding={{ horizontal: 16 }} frame={{ height: 32 }} background="rgba(240, 242, 245, 0.4)">
        <Image systemName="shield.lefthalf.filled" font={{ size: 14, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 12, name: "system-bold" }} padding={{ leading: 6 }} foregroundStyle="label">{debugMsg}</Text>
        <Spacer />
        <Button action={() => {
           setMode(mode === KeyboardMode.Standard ? KeyboardMode.Agent : KeyboardMode.Standard);
           HapticFeedback.lightImpact();
        }} buttonStyle="plain">
          <ZStack background={mode === KeyboardMode.Standard ? "rgba(255,255,255,0.7)" : "systemOrange"} clipShape={{type:'rect', cornerRadius: 8}} padding={{horizontal: 10, vertical: 5}}>
             <Text font={{ size: 9, name: "system-bold" }} foregroundStyle={mode === KeyboardMode.Standard ? "label" : "white"}>
               {mode === KeyboardMode.Standard ? "🕵️ 特工模式" : "⌨️ 打字模式"}
             </Text>
          </ZStack>
        </Button>
      </HStack>

      <VStack spacing={7} padding={{ top: 8, leading: 3, trailing: 3, bottom: 6 }} frame={{ maxWidth: "infinity" }}>
        {mode === KeyboardMode.Standard ? (
          /* 🅰️ 標準鍵盤佈局 - 嚴格物理對位 */
          <VStack spacing={7} alignment="center">
            
            {/* ROW 1: ㄅ-ㄎ / Q-P */}
            <RowView chars={lang === KeyboardLang.ZH ? "1 2 3 4 5 6 7 8 9 0" : "Q W E R T Y U I O P"} spacing={4} keyWidth={34} />

            {/* ROW 2: ㄏ-ㄘ / A-L */}
            <RowView chars={lang === KeyboardLang.ZH ? "Q W E R T Y U I O P" : "A S D F G H J K L"} spacing={4} keyWidth={34} />
            
            {/* ROW 3: ㄙ-ㄢ / (隱藏) */}
            {lang === KeyboardLang.ZH ? (
              <RowView chars="A S D F G H J K L ;" spacing={4} keyWidth={34} />
            ) : null}

            {/* ROW 4: 加密特殊/聲調鍵 */}
            <HStack spacing={4} alignment="center">
              <KeyView 
                title={capsState === CapsState.Locked ? "🔒" : "⇧"} 
                minWidth={lang === KeyboardLang.ZH ? 38 : 42} 
                height={44} 
                functional
                action={() => setCapsState(capsState === CapsState.Off ? CapsState.On : CapsState.Off)} 
                onTapGesture={{ count: 2, perform: () => { setCapsState(CapsState.Locked); HapticFeedback.lightImpact(); } }}
                foregroundStyle={capsState !== CapsState.Off ? "systemBlue" : "label"} 
              />
              <RowView chars={lang === KeyboardLang.ZH ? "Z X C V B N M , . / '" : "Z X C V B N M"} spacing={4} keyWidth={lang === KeyboardLang.ZH ? 25 : 34} />
              <KeyView title="⌫" minWidth={lang === KeyboardLang.ZH ? 38 : 42} height={44} functional action={() => CustomKeyboard.deleteBackward()} />
            </HStack>
            
            {/* ROW 5: 底部控制列 */}
            <HStack spacing={6} alignment="center">
              <KeyView title={lang === KeyboardLang.ZH ? "中" : "EN"} minWidth={52} height={44} functional action={() => setLang(lang === KeyboardLang.ZH ? KeyboardLang.EN : KeyboardLang.ZH)} />
              <KeyView title="space" wide={true} minWidth={180} height={44} action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="換行" minWidth={62} height={44} functional fontSize={14} action={() => CustomKeyboard.insertText("\n")} />
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工面板保持穩定 */
          <VStack spacing={12} padding={10}>
            <HStack spacing={15}>
               <KeyView title="隱入塵煙" action={handleEncode} wide={true} minWidth={170} background="rgba(255, 69, 0, 0.1)" foregroundStyle="systemOrange" height={60} />
               <KeyView title="洞穿真相" action={handleDecode} wide={true} minWidth={170} background="rgba(0, 122, 255, 0.1)" foregroundStyle="systemBlue" height={60} />
            </HStack>
            <ZStack background="rgba(255,255,255,0.9)" clipShape={{ type: 'rect', cornerRadius: 10 }} frame={{ maxWidth: "infinity", height: 90 }}>
              {decodedContent ? (
                <ScrollView padding={12}>
                  <Text font={{ size: 16, name: "system" }} foregroundStyle="label">{decodedContent}</Text>
                </ScrollView>
              ) : (
                <VStack alignment="center" opacity={0.3}>
                  <Image systemName="waveform.and.magnifyingglass" font={{ size: 32, name: "system" }} foregroundStyle="label" />
                </VStack>
              )}
            </ZStack>
            <HStack spacing={15}>
               <KeyView title="清除內容" action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } setDecodedContent(""); }} wide={true} minWidth={170} background="rgba(172, 179, 187, 0.5)" foregroundStyle="red" height={44} />
               <KeyView title="鍵盤主單" action={() => setMode(KeyboardMode.Standard)} wide={true} minWidth={170} background="rgba(172, 179, 187, 0.5)" height={44} />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
