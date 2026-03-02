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
 * 龍蝦暗號 v2.1.1 [TypeScript 嚴格模式修復與樣式對齊]
 */
export default function MainView() {
  // ⚡️ 效能對位：分塊訂閱狀態，防止全量重繪
  const { mode, setMode } = selectStore(s => ({ mode: s.mode, setMode: s.setMode }));
  const { lang, setLang } = selectStore(s => ({ lang: s.lang, setLang: s.setLang }));
  const { capsState, setCapsState } = selectStore(s => ({ capsState: s.capsState, setCapsState: s.setCapsState }));
  const { debugMsg, setDebugMsg } = selectStore(s => ({ debugMsg: s.debugMsg, setDebugMsg: s.setDebugMsg }));
  const { decodedContent, setDecodedContent } = selectStore(s => ({ decodedContent: s.decodedContent, setDecodedContent: s.setDecodedContent }));

  const handleEncode = () => {
    const currentText = CustomKeyboard.allText || "";
    if (!currentText) { 
      setDebugMsg("無內容隱入"); 
      HapticFeedback.lightImpact();
      return; 
    }
    const cipher = encode(currentText);
    
    // 🧪 精準替換協議：根據字串長度執行物理刪除
    const deleteCount = currentText.length;
    for(let i = 0; i < deleteCount; i++) {
      CustomKeyboard.deleteBackward();
    }
    
    CustomKeyboard.insertText(cipher);
    setDebugMsg("暗號就緒 🦞");
    HapticFeedback.lightImpact();
  };

  const handleDecode = async () => {
    let clip: string | null = null;
    try { 
      clip = await (typeof Pasteboard !== 'undefined' ? Pasteboard.getString() : Clipboard.getString()); 
    } catch (e) {}
    
    if (!clip || !clip.includes(MARKER)) { 
      setDebugMsg("未發現暗號"); 
      HapticFeedback.lightImpact();
      return; 
    }
    
    const result = decode(clip);
    setDecodedContent(result);
    setDebugMsg("解碼完成 👁️");
    HapticFeedback.lightImpact();
  };

  const FUNCTIONAL_GRAY = "systemGray2";

  return (
    <VStack spacing={0} background="systemGroupedBackground" frame={{ maxWidth: "infinity", height: 260 }}>
      
      {/* 🚀 重心下移：頂部 Spacer 按鍵往下推 */}
      <Spacer />

      {/* 🔮 龍蝦互動列 */}
      <HStack padding={{ horizontal: 16 }} frame={{ height: 40 }} background="rgba(240, 242, 245, 0.4)">
        <Image systemName="shield.lefthalf.filled" font={{ size: 14, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 12, name: "system-bold" }} padding={{ leading: 6 }} foregroundStyle="label">{debugMsg}</Text>
        <Spacer />
        <Button action={() => {
           setMode(mode === KeyboardMode.Standard ? KeyboardMode.Agent : KeyboardMode.Standard);
           HapticFeedback.lightImpact();
        }} buttonStyle="plain">
          <ZStack background={mode === KeyboardMode.Standard ? "systemBackground" : "systemOrange"} clipShape={{type:'rect', cornerRadius: 8}} padding={{horizontal: 10, vertical: 6}}>
             <Text font={{ size: 10, name: "system-bold" }} foregroundStyle={mode === KeyboardMode.Standard ? "label" : "white"}>
               {mode === KeyboardMode.Standard ? "🕵️ 特工模式" : "⌨️ 打字模式"}
             </Text>
          </ZStack>
        </Button>
      </HStack>

      <VStack spacing={6} padding={{ top: 8, leading: 4, trailing: 4, bottom: 10 }} frame={{ maxWidth: "infinity" }}>
        {mode === KeyboardMode.Standard ? (
          <VStack spacing={6} alignment="center">
            {/* Row 0: 數字快速鍵 */}
            <HStack spacing={4}>
              {"1 2 3 4 5 6 7 8 9 0".split(' ').map((num, i) => (
                <KeyView 
                  key={i} 
                  title={num} 
                  minWidth={35} 
                  height={40}
                  fontSize={16}
                  background="systemBackground"
                  action={() => CustomKeyboard.insertText(num)} 
                />
              ))}
            </HStack>

            <RowView chars="Q W E R T Y U I O P" spacing={5} keyWidth={34} />
            <RowView chars="A S D F G H J K L" spacing={5} keyWidth={34} />
            
            <HStack spacing={6} alignment="center">
              <KeyView 
                title={capsState === CapsState.Locked ? "🔒" : "⇧"} 
                minWidth={44} 
                height={44} 
                action={() => {
                  setCapsState(capsState === CapsState.Off ? CapsState.On : CapsState.Off);
                }} 
                onTapGesture={{
                  count: 2,
                  perform: () => {
                    setCapsState(CapsState.Locked);
                    HapticFeedback.lightImpact();
                  }
                }}
                background={capsState !== CapsState.Off ? "systemBackground" : FUNCTIONAL_GRAY} 
                foregroundStyle={capsState !== CapsState.Off ? "systemBlue" : "label"} 
              />
              <RowView chars="Z X C V B N M" spacing={6} keyWidth={34} />
              <KeyView title="⌫" minWidth={44} height={44} background={FUNCTIONAL_GRAY} action={() => CustomKeyboard.deleteBackward()} />
            </HStack>
            
            <HStack spacing={8} alignment="center">
              <KeyView title={lang === KeyboardLang.ZH ? "中" : "EN"} minWidth={54} height={44} background={FUNCTIONAL_GRAY} action={() => setLang(lang === KeyboardLang.ZH ? KeyboardLang.EN : KeyboardLang.ZH)} />
              <KeyView title="space" wide={true} minWidth={185} height={44} background="systemBackground" action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="換行" minWidth={68} height={44} background={FUNCTIONAL_GRAY} fontSize={14} action={() => CustomKeyboard.insertText("\n")} />
            </HStack>
          </VStack>
        ) : (
          <VStack spacing={12} padding={10}>
            <HStack spacing={15}>
               <KeyView title="🦞 隱入塵煙" action={handleEncode} wide={true} minWidth={170} background="rgba(255, 69, 0, 0.15)" foregroundStyle="systemOrange" height={60} />
               <KeyView title="👁️ 洞穿真相" action={handleDecode} wide={true} minWidth={170} background="rgba(0, 122, 255, 0.15)" foregroundStyle="systemBlue" height={60} />
            </HStack>
            <ZStack background="systemBackground" clipShape={{ type: 'rect', cornerRadius: 12 }} frame={{ maxWidth: "infinity", height: 90 }} shadow={{ color: "rgba(0,0,0,0.1)", radius: 4 }}>
              {decodedContent ? (
                <ScrollView padding={12}>
                  <Text font={{ size: 16, name: "system" }} foregroundStyle="label">{decodedContent}</Text>
                </ScrollView>
              ) : (
                <VStack alignment="center" opacity={0.3}>
                  <Image systemName="waveform.and.magnifyingglass" font={{ size: 32, name: "system" }} foregroundStyle="label" />
                  <Text font={{ size: 12, name: "system" }} foregroundStyle="label" padding={{ top: 8 }}>等待解碼暗號...</Text>
                </VStack>
              )}
            </ZStack>
            <HStack spacing={15}>
               <KeyView title="清除內容" action={() => { 
                 while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } 
                 setDecodedContent("");
                 setDebugMsg("已物理清除內容");
               }} wide={true} minWidth={170} background={FUNCTIONAL_GRAY} foregroundStyle="red" height={44} />
               <KeyView title="返回主單" action={() => CustomKeyboard.dismissToHome()} wide={true} minWidth={170} background={FUNCTIONAL_GRAY} height={44} />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
