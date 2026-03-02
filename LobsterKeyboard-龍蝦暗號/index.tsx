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
 * 龍蝦暗號 v1.9 [統一背景 & 物理圓角標校]
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
    <VStack spacing={0} background="rgba(209, 211, 217, 0.9)" frame={{ maxWidth: "infinity", height: 260 }}>
      {/* 🔮 龍蝦 Toolbar - 物理統一視覺 */}
      <HStack padding={{ horizontal: 10 }} frame={{ height: 36 }} background="rgba(255, 255, 255, 0.5)">
        <Image systemName="shield.lefthalf.filled" font={{ size: 12, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 10, name: "system-bold" }}> 龍蝦隱寫 v1.9 </Text>
        <Spacer />
        <Text font={{ size: 8, name: "system" }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        <Button action={() => setMode(mode === 0 ? 1 : 0)} buttonStyle="plain">
          <HStack 
            padding={{horizontal: 10, vertical: 5}} 
            background={mode === 0 ? "rgba(0, 0, 0, 0.05)" : "systemOrange"} 
            clipShape={{ type: 'rect', cornerRadius: 8 }}
          >
             <Text font={{ size: 10, name: "system-bold" }} foregroundStyle={mode === 0 ? "black" : "white"}>
               {mode === 0 ? "特工模式" : "標準模式"}
             </Text>
          </HStack>
        </Button>
      </HStack>

      {/* ⌨️ 鍵盤主體 v1.9 統一質感佈局 */}
      <VStack spacing={6} padding={{ top: 8, leading: 2, trailing: 2, bottom: 4 }} frame={{ maxWidth: "infinity" }}>
        {mode === 0 ? (
          <VStack spacing={6} alignment="center">
            
            {/* 🎲 Row 0: 物理數字排 - 統一背景 */}
            <HStack spacing={4} alignment="center">
              {"1 2 3 4 5 6 7 8 9 0".split(' ').map((num, i) => (
                <KeyView 
                  key={i} 
                  title={num} 
                  fontSize={15}
                  minWidth={34} // 鎖定物理寬度
                  height={38}
                  action={() => CustomKeyboard.insertText(num)} 
                />
              ))}
            </HStack>

            {/* 🅰️ Row 1: Q-P */}
            <RowView chars="Q W E R T Y U I O P" spacing={4} />
            
            {/* 🅰️ Row 2: A-L (置中對齊) */}
            <HStack spacing={4} alignment="center">
               <RowView chars="A S D F G H J K L" spacing={4} />
            </HStack>
            
            {/* 🅰️ Row 3: ⇧ + Z-M + ⌫ */}
            <HStack spacing={4} alignment="center">
              <KeyView 
                title="⇧" 
                minWidth={44} 
                height={42} 
                action={() => setCapsState(capsState === 0 ? 1 : 0)} 
                background={capsState !== 0 ? "rgba(0, 122, 255, 0.8)" : "rgba(255, 255, 255, 0.5)"} 
                foregroundStyle={capsState !== 0 ? "white" : "black"} 
              />
              <RowView chars="Z X C V B N M" spacing={4} />
              <KeyView 
                title="⌫" 
                minWidth={44} 
                height={42} 
                background="rgba(255, 255, 255, 0.5)"
                action={() => CustomKeyboard.deleteBackward()} 
              />
            </HStack>
            
            {/* 🎹 Row 4: 功能區 (EN/ZH, Space, Return, Globe) */}
            <HStack spacing={6} alignment="center">
              <KeyView 
                title={lang === 0 ? "中" : "EN"} 
                minWidth={48} 
                height={42} 
                background="rgba(255, 255, 255, 0.5)"
                action={() => setLang(lang === 0 ? 1 : 0)} 
              />
              <KeyView 
                title="space" 
                wide={true} 
                minWidth={170} 
                height={42} 
                action={() => CustomKeyboard.insertText(" ")} 
              />
              <KeyView 
                title="換行" 
                minWidth={60} 
                height={42} 
                background="rgba(255, 255, 255, 0.5)"
                fontSize={12} 
                action={() => CustomKeyboard.insertText("\n")} 
              />
              <Button action={() => CustomKeyboard.nextKeyboard()} buttonStyle="plain">
                <ZStack 
                  background="rgba(255, 255, 255, 0.5)" 
                  clipShape={{ type: 'rect', cornerRadius: 10 }}
                  frame={{width: 44, height: 42}}
                >
                  <Image systemName="globe" font={{size: 18, name: "system"}} foregroundStyle="black"/>
                </ZStack>
              </Button>
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工模式儀表板 */
          <VStack spacing={12} padding={8}>
            <HStack spacing={12}>
               <KeyView title="🦞 隱入塵煙" action={handleEncode} wide={true} minWidth={165} background="rgba(255, 69, 0, 0.2)" foregroundStyle="systemOrange" height={55} />
               <KeyView title="👁️ 洞穿真相" action={handleDecode} wide={true} minWidth={165} background="rgba(0, 122, 255, 0.2)" foregroundStyle="systemBlue" height={55} />
            </HStack>
            <ZStack 
              background="rgba(255, 255, 255, 0.8)" 
              clipShape={{ type: 'rect', cornerRadius: 12 }}
              frame={{ maxWidth: "infinity", height: 75 }}
            >
              {decodedContent ? (
                <ScrollView padding={10}><Text font={{ size: 15, name: "system" }}>{decodedContent}</Text></ScrollView>
              ) : (
                <VStack alignment="center" opacity={0.2}><Image systemName="waveform" font={{size: 24, name: "system"}}/></VStack>
              )}
            </ZStack>
            <HStack spacing={12}>
               <KeyView title="清除" action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } }} wide={true} minWidth={165} background="rgba(255, 255, 255, 0.4)" foregroundStyle="red" />
               <KeyView title="返回主單" action={() => CustomKeyboard.dismissToHome()} wide={true} minWidth={165} background="rgba(255, 255, 255, 0.4)" />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
