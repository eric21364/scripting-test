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

// ⚠️ 全域聲明
declare const CustomKeyboard: any;
declare const Pasteboard: any;
declare const Clipboard: any;

/**
 * 龍蝦暗號 v1.7.1 [TypeScript 物理補完]
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
    for(let i = 0; i < 10; i++) { if (CustomKeyboard.hasText) CustomKeyboard.deleteBackward(); }
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

  return (
    <VStack spacing={0} background="#D1D3D9" frame={{ maxWidth: "infinity", height: 210 }}>
      {/* 🔮 龍蝦 Toolbar */}
      <HStack padding={{ horizontal: 10 }} frame={{ height: 36 }} background="#F8F8F8">
        <Image systemName="shield.lefthalf.filled" font={{ size: 12, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 11, name: "system-bold" }}> 龍蝦隱寫 v1.7.1 </Text>
        <Spacer />
        <Text font={{ size: 9, name: "system" }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        <Button action={() => setMode(mode === 0 ? 1 : 0)} buttonStyle="plain">
          <HStack 
            padding={{horizontal: 8, vertical: 4}} 
            background={mode === 0 ? "#E0E0E0" : "systemOrange"} 
            clipShape={{ type: 'rect', cornerRadius: 6 }}
          >
             <Text font={{ size: 10, name: "system-bold" }} foregroundStyle={mode === 0 ? "label" : "white"}>
               {mode === 0 ? "特工模式" : "打字模式"}
             </Text>
          </HStack>
        </Button>
      </HStack>

      {/* ⌨️ 鍵盤主體佈局 */}
      <VStack spacing={4} padding={{ top: 6, leading: 2, trailing: 2, bottom: 4 }} frame={{ maxWidth: "infinity" }}>
        {mode === 0 ? (
          <VStack spacing={6} alignment="center">
            <RowView chars="Q W E R T Y U I O P" spacing={3} />
            <RowView chars="A S D F G H J K L" spacing={3} />
            <HStack spacing={3} alignment="center">
              <KeyView title="⇧" minWidth={35} height={38} action={() => setCapsState(capsState === 0 ? 1 : 0)} background={capsState !== 0 ? "systemBlue" : "#B0B5BD"} foregroundStyle={capsState !== 0 ? "white" : "label"} />
              <RowView chars="Z X C V B N M" spacing={3} />
              <KeyView title="⌫" minWidth={35} height={38} background="#B0B5BD" action={() => CustomKeyboard.deleteBackward()} />
            </HStack>
            <HStack spacing={4} alignment="center">
              <KeyView title={lang === 0 ? "中" : "EN"} minWidth={40} height={38} background="#B0B5BD" action={() => setLang(lang === 0 ? 1 : 0)} />
              <KeyView title="space" wide={true} minWidth={160} height={38} action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="換行" minWidth={40} height={38} background="#B0B5BD" fontSize={12} action={() => CustomKeyboard.insertText("\n")} />
              <Button action={() => CustomKeyboard.nextKeyboard()} buttonStyle="plain">
                <ZStack 
                  background="#B0B5BD" 
                  clipShape={{ type: 'rect', cornerRadius: 6 }}
                  frame={{width: 35, height: 38}}
                >
                  <Image systemName="globe" font={{size: 16, name: "system"}}/>
                </ZStack>
              </Button>
            </HStack>
          </VStack>
        ) : (
          <VStack spacing={8} padding={8}>
            <HStack spacing={10}>
               <KeyView title="🦞 隱入塵煙" action={handleEncode} wide={true} minWidth={140} background="rgba(255, 69, 0, 0.1)" foregroundStyle="systemOrange" height={50} />
               <KeyView title="👁️ 洞穿真相" action={handleDecode} wide={true} minWidth={140} background="rgba(0, 122, 255, 0.1)" foregroundStyle="systemBlue" height={50} />
            </HStack>
            <ZStack 
              background="rgba(255,255,255,0.5)" 
              clipShape={{ type: 'rect', cornerRadius: 8 }}
              frame={{ maxWidth: "infinity", height: 60 }}
            >
              {decodedContent ? (
                <ScrollView padding={6}><Text font={{ size: 14, name: "system" }}>{decodedContent}</Text></ScrollView>
              ) : (
                <VStack alignment="center" opacity={0.3}><Image systemName="waveform.path.ecg" font={{size: 20, name: "system"}}/></VStack>
              )}
            </ZStack>
            <HStack spacing={10}>
               <KeyView title="清除" action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } }} minWidth={100} height={40} background="#B0B5BD" foregroundStyle="systemRed" />
               <Spacer />
               <KeyView title="返回系統" action={() => CustomKeyboard.dismissToHome()} minWidth={100} height={40} background="#B0B5BD" />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
