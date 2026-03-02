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
 * 龍蝦暗號 v2.0.5 [範本基因轉殖版]
 * 1. 物理對位：徹底拋棄 ZStack 嵌套，回歸 Button title 渲染防止寬度坍塌
 * 2. 佈局下壓：頂部留白增大，將鍵盤推向操作區
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
    setDebugMsg("解碼完成 👁️");
  };

  const FUNCTIONAL_GRAY = "#ABB1B6";

  return (
    <VStack spacing={0} background="#828A91" frame={{ maxWidth: "infinity", height: 260 }}>
      
      {/* 🚀 佈局下壓計畫：在頂部加入 Spacer 推擠按鍵 */}
      <Spacer />

      {/* 🔮 龍蝦 Toolbar */}
      <HStack padding={{ horizontal: 16 }} frame={{ height: 38 }} background="rgba(240, 242, 245, 0.9)">
        <Image systemName="shield.lefthalf.filled" font={{ size: 14, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 12, name: "system-bold" }} padding={{ leading: 6 }}>龍蝦標校 v2.0.5</Text>
        <Spacer />
        <Button action={() => setMode(mode === 0 ? 1 : 0)} buttonStyle="plain">
          <ZStack background={mode === 0 ? "rgba(0,0,0,0.05)" : "systemOrange"} clipShape={{type:'rect', cornerRadius: 8}} padding={{horizontal: 10, vertical: 6}}>
             <Text font={{ size: 10, name: "system-bold" }} foregroundStyle={mode === 0 ? "black" : "white"}>
               {mode === 0 ? "特工模式" : "標準模式"}
             </Text>
          </ZStack>
        </Button>
      </HStack>

      <VStack spacing={6} padding={{ top: 8, leading: 6, trailing: 6, bottom: 8 }} frame={{ maxWidth: "infinity" }}>
        {mode === 0 ? (
          /* 🅰️ 實體對位佈局：與官方 Demo 物理同步 */
          <VStack spacing={8} alignment="center">
            
            {/* Row 0: 數字排 */}
            <HStack spacing={4} alignment="center">
              {"1 2 3 4 5 6 7 8 9 0".split(' ').map((num, i) => (
                <KeyView 
                  key={i} 
                  title={num} 
                  minWidth={34} 
                  height={38}
                  fontSize={16}
                  background="rgba(255, 255, 255, 0.7)"
                  action={() => CustomKeyboard.insertText(num)} 
                />
              ))}
            </HStack>

            {/* Row 1: Q-P */}
            <RowView chars="Q W E R T Y U I O P" spacing={6} />
            
            {/* Row 2: A-L */}
            <RowView chars="A S D F G H J K L" spacing={6} />
            
            {/* Row 3: ⇧ + Z-M + ⌫ */}
            <HStack spacing={6} alignment="center">
              <KeyView 
                title="⇧" 
                minWidth={44} 
                height={42} 
                action={() => setCapsState(capsState === 0 ? 1 : 0)} 
                background={capsState !== 0 ? "white" : FUNCTIONAL_GRAY} 
                foregroundStyle={capsState !== 0 ? "#007AFF" : "black"} 
              />
              <RowView chars="Z X C V B N M" spacing={6} />
              <KeyView 
                title="⌫" 
                minWidth={44} 
                height={42} 
                background={FUNCTIONAL_GRAY}
                action={() => CustomKeyboard.deleteBackward()} 
              />
            </HStack>
            
            {/* Row 4: 底部功能列 */}
            <HStack spacing={8} alignment="center">
              <KeyView 
                title={lang === 0 ? "中" : "EN"} 
                minWidth={54} 
                height={42} 
                background={FUNCTIONAL_GRAY}
                action={() => setLang(lang === 0 ? 1 : 0)} 
              />
              <KeyView 
                title="space" 
                wide={true} 
                minWidth={170} 
                height={42} 
                background="white"
                action={() => CustomKeyboard.insertText(" ")} 
              />
              <KeyView 
                title="換行" 
                minWidth={68} 
                height={42} 
                background={FUNCTIONAL_GRAY}
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
            <ZStack background="white" clipShape={{ type: 'rect', cornerRadius: 10 }} frame={{ maxWidth: "infinity", height: 100 }}>
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
               <KeyView title="清除" action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } }} wide={true} minWidth={170} background={FUNCTIONAL_GRAY} foregroundStyle="red" height={45} />
               <KeyView title="返回主單" action={() => CustomKeyboard.dismissToHome()} wide={true} minWidth={170} background={FUNCTIONAL_GRAY} height={45} />
            </HStack>
          </VStack>
        )}
      </VStack>
      
    </VStack>
  );
}
