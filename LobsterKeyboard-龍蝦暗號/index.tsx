import {
  Text,
  HStack,
  VStack,
  Button,
  Spacer,
  Image,
  ZStack,
  ScrollView
} from "scripting";

// @ts-ignore
import { useStore } from "./store";
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
 * 龍蝦暗號 v1.9.4 [完美對位 & 實體外框版]
 */
export default function MainView() {
  const store = useStore() as any;
  const { 
    mode, setMode, lang, setLang,
    capsState, setCapsState, 
    debugMsg, setDebugMsg, 
    decodedContent, setDecodedContent 
  } = store;

  const handleEncode = () => {
    const currentText = CustomKeyboard.allText;
    if (!currentText) { setDebugMsg("無波段"); return; }
    const cipher = encode(currentText);
    for(let i = 0; i < 20; i++) { if (CustomKeyboard.hasText) CustomKeyboard.deleteBackward(); }
    CustomKeyboard.insertText(cipher);
    setDebugMsg("暗號就緒 🦞");
  };

  const handleDecode = async () => {
    let clip: string | null = null;
    try { clip = await (typeof Pasteboard !== 'undefined' ? Pasteboard.getString() : Clipboard.getString()); } catch (e) {}
    if (!clip || !clip.includes(MARKER)) { setDebugMsg("未發現暗號"); return; }
    const result = decode(clip);
    setDecodedContent(result);
    setDebugMsg("解讀完成 👁️");
  };

  return (
    <VStack spacing={0} background="rgba(209, 211, 217, 0.95)" frame={{ maxWidth: "infinity", height: 280 }}>
      
      {/* 🔮 龍蝦 Toolbar */}
      <HStack padding={{ horizontal: 16 }} frame={{ height: 40 }} background="rgba(255, 255, 255, 0.8)">
        <Image systemName="shield.lefthalf.filled" font={{ size: 14, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 12, name: "system-bold" }}> 龍蝦隱寫 v1.9.4 </Text>
        <Spacer />
        <Button action={() => setMode(mode === 0 ? 1 : 0)} buttonStyle="plain">
          <HStack 
            padding={{horizontal: 10, vertical: 5}} 
            background={mode === 0 ? "rgba(0, 0, 0, 0.1)" : "systemOrange"} 
            clipShape={{ type: 'rect', cornerRadius: 8 }}
          >
             <Text font={{ size: 10, name: "system-bold" }} foregroundStyle={mode === 0 ? "black" : "white"}>
               {mode === 0 ? "特工模式" : "標準模式"}
             </Text>
          </HStack>
        </Button>
      </HStack>

      <VStack spacing={6} padding={{ top: 12, leading: 6, trailing: 6, bottom: 8 }} frame={{ maxWidth: "infinity" }}>
        {mode === 0 ? (
          /* 🅰️ 物理歸一 5 排佈局 */
          <VStack spacing={6} alignment="center">
            
            {/* Row 0: 數字排 - 寬度標校為 36pt，預留邊界 */}
            <HStack spacing={2} alignment="center">
              {"1 2 3 4 5 6 7 8 9 0".split(' ').map((num, i) => (
                <KeyView 
                  key={i} 
                  title={num} 
                  fontSize={16}
                  minWidth={36} 
                  height={40}
                  action={() => CustomKeyboard.insertText(num)} 
                />
              ))}
            </HStack>

            {/* Row 1: Q-P */}
            <RowView chars="Q W E R T Y U I O P" spacing={2} />
            
            {/* Row 2: A-L */}
            <RowView chars="A S D F G H J K L" spacing={2} />
            
            {/* Row 3: ⇧ + Z-M + ⌫ */}
            <HStack spacing={4} alignment="center">
              <KeyView 
                title="⇧" 
                minWidth={46} 
                height={42} 
                action={() => setCapsState(capsState === 0 ? 1 : 0)} 
                background={capsState !== 0 ? "rgba(0, 122, 255, 1)" : "rgba(255, 255, 255, 0.6)"} 
                foregroundStyle={capsState !== 0 ? "white" : "black"} 
              />
              <RowView chars="Z X C V B N M" spacing={2} />
              <KeyView 
                title="⌫" 
                minWidth={46} 
                height={42} 
                background="rgba(255, 255, 255, 0.6)"
                action={() => CustomKeyboard.deleteBackward()} 
              />
            </HStack>
            
            {/* Row 4: 底部 - 空白鍵 185pt 實體居中 */}
            <HStack spacing={6} alignment="center">
              <KeyView 
                title={lang === 0 ? "中" : "EN"} 
                minWidth={50} 
                height={42} 
                background="rgba(255, 255, 255, 0.6)"
                action={() => setLang(lang === 0 ? 1 : 0)} 
              />
              <KeyView 
                title="space" 
                wide={true} 
                minWidth={185} 
                height={42} 
                background="rgba(255, 255, 255, 1)"
                action={() => CustomKeyboard.insertText(" ")} 
              />
              <KeyView 
                title="換行" 
                minWidth={66} 
                height={42} 
                background="rgba(255, 255, 255, 0.6)"
                fontSize={13} 
                action={() => CustomKeyboard.insertText("\n")} 
              />
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工面板 */
          <VStack spacing={12} padding={10}>
            <HStack spacing={15}>
               <KeyView title="🦞 隱入塵煙" action={handleEncode} wide={true} minWidth={170} background="rgba(255, 69, 0, 0.2)" foregroundStyle="systemOrange" height={60} />
               <KeyView title="👁️ 洞穿真相" action={handleDecode} wide={true} minWidth={170} background="rgba(0, 122, 255, 0.2)" foregroundStyle="systemBlue" height={60} />
            </HStack>
            <ZStack background="white" clipShape={{ type: 'rect', cornerRadius: 12 }} frame={{ maxWidth: "infinity", height: 80 }}>
              {decodedContent ? (
                <ScrollView padding={10}>
                  <Text font={{ size: 16, name: "system" }}>{decodedContent}</Text>
                </ScrollView>
              ) : (
                <VStack alignment="center" opacity={0.2}>
                  <Image systemName="waveform" font={{ size: 28, name: "system" }} />
                </VStack>
              )}
            </ZStack>
            <HStack spacing={15}>
               <KeyView title="清除" action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } }} wide={true} minWidth={170} background="rgba(255, 255, 255, 0.6)" foregroundStyle="red" height={42} />
               <KeyView title="返回系統" action={() => CustomKeyboard.dismissToHome()} wide={true} minWidth={170} background="rgba(255, 255, 255, 0.6)" height={42} />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
