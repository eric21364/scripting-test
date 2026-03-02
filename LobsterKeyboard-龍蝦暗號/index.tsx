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
 * 龍蝦暗號 v1.9.3 [寬度與類型最終對位版]
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
    <VStack spacing={0} background="rgba(200, 203, 210, 0.95)" frame={{ maxWidth: "infinity", height: 280 }}>
      {/* 🔮 龍蝦 霧化 Toolbar */}
      <HStack padding={{ horizontal: 12 }} frame={{ height: 40 }} background="rgba(255, 255, 255, 0.6)">
        <Image systemName="shield.lefthalf.filled" font={{ size: 14, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 12, name: "system-bold" }}> 龍蝦標校 v1.9.3 </Text>
        <Spacer />
        <Button action={() => setMode(mode === 0 ? 1 : 0)} buttonStyle="plain">
          <HStack 
            padding={{horizontal: 10, vertical: 5}} 
            background={mode === 0 ? "rgba(0, 0, 0, 0.08)" : "systemOrange"} 
            clipShape={{ type: 'rect', cornerRadius: 8 }}
          >
             <Text font={{ size: 10, name: "system-bold" }} foregroundStyle={mode === 0 ? "black" : "white"}>
               {mode === 0 ? "特工模式" : "標準模式"}
             </Text>
          </HStack>
        </Button>
      </HStack>

      {/* ⌨️ 鍵盤主體 v1.9.3 */}
      <VStack spacing={8} padding={{ top: 12, leading: 2, trailing: 2, bottom: 8 }} frame={{ maxWidth: "infinity" }}>
        {mode === 0 ? (
          <VStack spacing={8} alignment="center">
            
            {/* Row 0: 數字排 - 寬度上調至 42pt，物理飽滿化 */}
            <HStack spacing={2} alignment="center">
              {"1 2 3 4 5 6 7 8 9 0".split(' ').map((num, i) => (
                <KeyView 
                  key={i} 
                  title={num} 
                  fontSize={16}
                  minWidth={42} 
                  height={42}
                  background="rgba(255, 255, 255, 0.9)"
                  action={() => CustomKeyboard.insertText(num)} 
                />
              ))}
            </HStack>

            {/* Row 1: Q-P */}
            <RowView chars="Q W E R T Y U I O P" spacing={2} />
            
            {/* Row 2: A-L */}
            <RowView chars="A S D F G H J K L" spacing={2} />
            
            {/* Row 3: ⇧ + Z-M + ⌫ */}
            <HStack spacing={6} alignment="center">
              <KeyView 
                title="⇧" 
                minWidth={54} 
                height={44} 
                action={() => setCapsState(capsState === 0 ? 1 : 0)} 
                background={capsState !== 0 ? "rgba(0, 122, 255, 1)" : "rgba(255, 255, 255, 0.5)"} 
                foregroundStyle={capsState !== 0 ? "white" : "black"} 
              />
              <RowView chars="Z X C V B N M" spacing={2} />
              <KeyView 
                title="⌫" 
                minWidth={54} 
                height={44} 
                background="rgba(255, 255, 255, 0.5)"
                action={() => CustomKeyboard.deleteBackward()} 
              />
            </HStack>
            
            {/* Row 4: 底部 - 空白鍵 220pt 霸氣拓寬 */}
            <HStack spacing={8} alignment="center">
              <KeyView 
                title={lang === 0 ? "中" : "EN"} 
                minWidth={60} 
                height={44} 
                background="rgba(255, 255, 255, 0.5)"
                action={() => setLang(lang === 0 ? 1 : 0)} 
              />
              <KeyView 
                title="space" 
                wide={true} 
                minWidth={220} 
                height={44} 
                background="rgba(255, 255, 255, 0.9)"
                action={() => CustomKeyboard.insertText(" ")} 
              />
              <KeyView 
                title="換行" 
                minWidth={76} 
                height={44} 
                background="rgba(255, 255, 255, 0.5)"
                fontSize={13} 
                action={() => CustomKeyboard.insertText("\n")} 
              />
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工模式 */
          <VStack spacing={12} padding={10}>
            <HStack spacing={15}>
               <KeyView title="🦞 隱入塵煙" action={handleEncode} wide={true} minWidth={185} background="rgba(255, 69, 0, 0.25)" foregroundStyle="systemOrange" height={60} />
               <KeyView title="👁️ 洞穿真相" action={handleDecode} wide={true} minWidth={185} background="rgba(0, 122, 255, 0.25)" foregroundStyle="systemBlue" height={60} />
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
               <KeyView title="清除輸入" action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } }} wide={true} minWidth={185} background="rgba(255, 255, 255, 0.5)" foregroundStyle="red" />
               <KeyView title="返回主單" action={() => CustomKeyboard.dismissToHome()} wide={true} minWidth={185} background="rgba(255, 255, 255, 0.5)" />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
