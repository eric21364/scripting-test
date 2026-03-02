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
 * 龍蝦暗號 v2.0.4 [重心下移與高度壓縮版]
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
    if (!currentText) { setDebugMsg("無內容隱入"); return; }
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

  const FUNCTIONAL_GRAY = "rgba(171, 177, 182, 1)";

  return (
    <VStack spacing={0} background="#828A91" frame={{ maxWidth: "infinity", height: 240 }}>
      
      {/* 🚀 物理下壓：在頂部加上 Spacer 將內容往下方螢幕邊緣推 */}
      <Spacer />

      {/* 🔮 龍蝦 頂部 Toolbar - 壓縮高度 */}
      <HStack padding={{ horizontal: 16 }} frame={{ height: 34 }} background="rgba(240, 242, 245, 0.9)">
        <Image systemName="shield.lefthalf.filled" font={{ size: 12, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 11, name: "system-bold" }} padding={{ leading: 4 }}>龍蝦標校 v2.0.4</Text>
        <Spacer />
        <Text font={{ size: 9, name: "system" }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        <Button action={() => setMode(mode === 0 ? 1 : 0)} buttonStyle="plain">
          <ZStack background={mode === 0 ? "rgba(0,0,0,0.05)" : "systemOrange"} clipShape={{type:'rect', cornerRadius: 6}} padding={{horizontal: 10, vertical: 4}}>
             <Text font={{ size: 9, name: "system-bold" }} foregroundStyle={mode === 0 ? "black" : "white"}>
               {mode === 0 ? "特工" : "打字"}
             </Text>
          </ZStack>
        </Button>
      </HStack>

      {/* ⌨️ 鍵盤主體列 - 高度壓縮對位 */}
      <VStack spacing={4} padding={{ top: 4, leading: 6, trailing: 6, bottom: 6 }} frame={{ maxWidth: "infinity" }}>
        {mode === 0 ? (
          <VStack spacing={4} alignment="center">
            
            {/* Row 0: 數字排 - 壓縮高度 */}
            <HStack spacing={4} alignment="center">
              {"1 2 3 4 5 6 7 8 9 0".split(' ').map((num, i) => (
                <KeyView 
                  key={i} 
                  title={num} 
                  minWidth={34} 
                  height={34}
                  fontSize={14}
                  background="rgba(255, 255, 255, 0.9)"
                  action={() => CustomKeyboard.insertText(num)} 
                />
              ))}
            </HStack>

            {/* Rows 1-2: 字母排 - 物理鎖定 35pt */}
            <RowView chars="Q W E R T Y U I O P" spacing={4} keyWidth={35} />
            <RowView chars="A S D F G H J K L" spacing={4} keyWidth={35} />
            
            {/* Row 3: ⇧ + Z-M + ⌫ */}
            <HStack spacing={4} alignment="center">
              <KeyView 
                title="⇧" 
                minWidth={44} 
                height={40} 
                action={() => setCapsState(capsState === 0 ? 1 : 0)} 
                background={capsState !== 0 ? "white" : FUNCTIONAL_GRAY} 
                foregroundStyle={capsState !== 0 ? "#007AFF" : "black"} 
              />
              <RowView chars="Z X C V B N M" spacing={4} keyWidth={35} />
              <KeyView 
                title="⌫" 
                minWidth={44} 
                height={40} 
                background={FUNCTIONAL_GRAY}
                action={() => CustomKeyboard.deleteBackward()} 
              />
            </HStack>
            
            {/* Row 4: 底部功能列 */}
            <HStack spacing={6} alignment="center">
              <KeyView title={lang === 0 ? "中" : "EN"} minWidth={54} height={40} background={FUNCTIONAL_GRAY} action={() => setLang(lang === 0 ? 1 : 0)} />
              <KeyView title="space" wide={true} minWidth={185} height={40} action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="換行" minWidth={64} height={40} background={FUNCTIONAL_GRAY} fontSize={13} action={() => CustomKeyboard.insertText("\n")} />
            </HStack>
          </VStack>
        ) : (
          <VStack spacing={12} padding={10}>
            <HStack spacing={15}>
               <KeyView title="🦞 隱入塵煙" action={handleEncode} wide={true} minWidth={170} background="rgba(255, 69, 0, 0.25)" foregroundStyle="systemOrange" height={55} />
               <KeyView title="👁️ 洞穿真相" action={handleDecode} wide={true} minWidth={170} background="rgba(0, 122, 255, 0.25)" foregroundStyle="systemBlue" height={55} />
            </HStack>
            <ZStack background="white" clipShape={{ type: 'rect', cornerRadius: 10 }} frame={{ maxWidth: "infinity", height: 60 }}>
              {decodedContent ? (
                <ScrollView padding={8}><Text font={{ size: 14, name: "system" }}>{decodedContent}</Text></ScrollView>
              ) : (
                <VStack alignment="center" opacity={0.2}><Image systemName="waveform" font={{ size: 24, name: "system" }} /></VStack>
              )}
            </ZStack>
            <HStack spacing={15}>
               <KeyView title="清除" action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } }} wide={true} minWidth={170} background={FUNCTIONAL_GRAY} foregroundStyle="red" height={42} />
               <KeyView title="返回系統" action={() => CustomKeyboard.dismissToHome()} wide={true} minWidth={170} background={FUNCTIONAL_GRAY} height={42} />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
