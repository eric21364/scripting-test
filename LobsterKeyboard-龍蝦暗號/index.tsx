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
 * 龍蝦暗號 v1.7.4 [無框感標校與寬度歸一化]
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
    if (!clip || !clip.includes(MARKER)) { setDebugMsg("無暗號"); return; }
    const result = decode(clip);
    setDecodedContent(result);
    setDebugMsg("解析完成 👁️");
  };

  return (
    <VStack spacing={0} background="#D1D3D9" frame={{ maxWidth: "infinity", height: 216 }}>
      {/* 🔮 龍蝦 頂部控制列 */}
      <HStack padding={{ horizontal: 10 }} frame={{ height: 36 }} background="#F8F8F8">
        <Image systemName="shield.lefthalf.filled" font={{ size: 12, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 11, name: "system-bold" }}> 龍蝦隱寫 v1.7.4 </Text>
        <Spacer />
        <Text font={{ size: 8, name: "system" }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        <Button action={() => setMode(mode === 0 ? 1 : 0)} buttonStyle="plain">
          <HStack 
            padding={{horizontal: 8, vertical: 4}} 
            background={mode === 0 ? "#E0E0E0" : "systemOrange"} 
            clipShape={{ type: 'rect', cornerRadius: 6 }}
          >
             <Text font={{ size: 10, name: "system-bold" }} foregroundStyle={mode === 0 ? "black" : "white"}>
               {mode === 0 ? "特工模式" : "打字模式"}
             </Text>
          </HStack>
        </Button>
      </HStack>

      {/* ⌨️ 佈局主體 - 精確物理對齊 */}
      <VStack spacing={8} padding={{ top: 10, leading: 4, trailing: 4, bottom: 4 }} frame={{ maxWidth: "infinity" }}>
        {mode === 0 ? (
          /* 🅰️ 物理歸一化 QWERTY 佈局 */
          <VStack spacing={8} alignment="center">
            {/* Row 1: 10 鍵 */}
            <RowView chars="Q W E R T Y U I O P" spacing={4} />
            
            {/* Row 2: 9 鍵 - 精準置中 */}
            <HStack spacing={4} alignment="center">
              <RowView chars="A S D F G H J K L" spacing={4} />
            </HStack>
            
            {/* Row 3: Shift(44) + 7 鍵 + Delete(44) */}
            <HStack spacing={4} alignment="center">
              <KeyView 
                title="⇧" 
                minWidth={44} 
                height={42} 
                action={() => setCapsState(capsState === 0 ? 1 : 0)} 
                background={capsState !== 0 ? "white" : "#B0B5BD"} 
                foregroundStyle={capsState !== 0 ? "black" : "white"} 
              />
              <RowView chars="Z X C V B N M" spacing={4} />
              <KeyView 
                title="⌫" 
                minWidth={44} 
                height={42} 
                background="#B0B5BD" 
                action={() => CustomKeyboard.deleteBackward()} 
              />
            </HStack>
            
            {/* Row 4: 功能區位 (48, 170, 70) */}
            <HStack spacing={8} alignment="center">
              <KeyView 
                title={lang === 0 ? "中" : "EN"} 
                minWidth={48} 
                height={42} 
                background="#B0B5BD" 
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
                minWidth={70} 
                height={42} 
                background="#B0B5BD" 
                fontSize={13} 
                action={() => CustomKeyboard.insertText("\n")} 
              />
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工面板 - 對位標校 */
          <VStack spacing={10} padding={8}>
            <HStack spacing={10}>
               <KeyView title="🦞 隱入塵煙" action={handleEncode} wide={true} minWidth={165} background="rgba(255, 69, 0, 0.1)" foregroundStyle="systemOrange" height={52} />
               <KeyView title="👁️ 洞穿真相" action={handleDecode} wide={true} minWidth={165} background="rgba(0, 122, 255, 0.1)" foregroundStyle="systemBlue" height={52} />
            </HStack>
            <ZStack 
              background="white" 
              clipShape={{ type: 'rect', cornerRadius: 8 }}
              frame={{ maxWidth: "infinity", height: 60 }}
            >
              {decodedContent ? (
                <ScrollView padding={8}><Text font={{ size: 14, name: "system" }}>{decodedContent}</Text></ScrollView>
              ) : (
                <VStack alignment="center" opacity={0.2}><Image systemName="waveform" font={{size: 20, name: "system"}}/></VStack>
              )}
            </ZStack>
            <HStack spacing={12}>
               <KeyView title="清除" action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } }} wide={true} minWidth={165} background="#B0B5BD" foregroundStyle="red" height={40}/>
               <KeyView title="返回主單" action={() => CustomKeyboard.dismissToHome()} wide={true} minWidth={165} background="#B0B5BD" height={40} />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
