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
import { useStore, KeyboardMode } from "./store";
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
 * 龍蝦暗號 v1.6 [佈局校準與注音強化]
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
    <VStack spacing={0} background="#D1D3D9" frame={{ maxWidth: "infinity", height: 320 }}>
      {/* 🔮 龍蝦 Toolbar */}
      <HStack padding={{ horizontal: 10 }} frame={{ height: 40 }} background="#F8F8F8">
        <Image systemName="shield.lefthalf.filled" font={{ size: 14, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 12, name: "system-bold" }}> 龍蝦隱寫 v1.6 </Text>
        <Spacer />
        <Text font={{ size: 10, name: "system" }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        <Button action={() => setMode(mode === 0 ? 1 : 0)} buttonStyle="plain">
          <HStack padding={{horizontal: 10, vertical: 5}} background={mode === 0 ? "#E0E0E0" : "systemOrange"} cornerRadius={8}>
             <Text font={{ size: 11, name: "system-bold" }} foregroundStyle={mode === 0 ? "label" : "white"}>
               {mode === 0 ? "特工模式" : "打字模式"}
             </Text>
          </HStack>
        </Button>
      </HStack>

      {/* ⌨️ 鍵盤主體佈局 */}
      <VStack spacing={8} padding={{ top: 10, leading: 2, trailing: 2, bottom: 4 }} frame={{ maxWidth: "infinity" }}>
        {mode === 0 ? (
          /* 🅰️ 改良型 QWERTY/注音 佈局：移除擠壓 */
          <VStack spacing={10} alignment="center">
            {/* 第一排 10 鍵 */}
            <RowView chars="Q W E R T Y U I O P" spacing={4} />
            
            {/* 第二排 9 鍵 - 置中校準 */}
            <RowView chars="A S D F G H J K L" spacing={4} />
            
            {/* 第三排 7 鍵 + 功能鍵 */}
            <HStack spacing={4} alignment="center">
              <KeyView title="⇧" minWidth={38} action={() => setCapsState(capsState === 0 ? 1 : 0)} background={capsState !== 0 ? "systemBlue" : "#B0B5BD"} foregroundStyle={capsState !== 0 ? "white" : "label"} />
              <RowView chars="Z X C V B N M" spacing={4} />
              <KeyView title="⌫" minWidth={38} background="#B0B5BD" action={() => CustomKeyboard.deleteBackward()} />
            </HStack>
            
            {/* 第四排 底部控制 */}
            <HStack spacing={6} alignment="center">
              <KeyView title={lang === 0 ? "中" : "EN"} minWidth={45} background="#B0B5BD" action={() => setLang(lang === 0 ? 1 : 0)} />
              <KeyView title="space" wide={true} minWidth={140} action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="換行" minWidth={45} background="#B0B5BD" fontSize={14} action={() => CustomKeyboard.insertText("\n")} />
              <Button action={() => CustomKeyboard.nextKeyboard()} buttonStyle="plain">
                <ZStack background="#B0B5BD" cornerRadius={6} frame={{width: 38, height: 44}}><Image systemName="globe" font={{size: 18, name: "system"}}/></ZStack>
              </Button>
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工面板 */
          <VStack spacing={12} padding={10}>
            <HStack spacing={12}>
               <KeyView title="🦞 隱入塵煙" action={handleEncode} wide={true} minWidth={160} background="rgba(255, 69, 0, 0.1)" foregroundStyle="systemOrange" height={70} />
               <KeyView title="👁️ 洞穿真相" action={handleDecode} wide={true} minWidth={160} background="rgba(0, 122, 255, 0.1)" foregroundStyle="systemBlue" height={70} />
            </HStack>
            <ZStack background="rgba(255,255,255,0.5)" cornerRadius={10} frame={{ maxWidth: "infinity", height: 100 }}>
              {decodedContent ? (
                <ScrollView padding={10}><Text font={{ size: 16, name: "system" }}>{decodedContent}</Text></ScrollView>
              ) : (
                <VStack alignment="center" opacity={0.3}><Image systemName="waveform.path.ecg" font={{size: 30}}/></VStack>
              )}
            </ZStack>
            <HStack spacing={10}>
               <KeyView title="清除輸入" action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } }} wide={true} minWidth={160} background="#B0B5BD" foregroundStyle="systemRed" />
               <KeyView title="返回主頁" action={() => CustomKeyboard.dismissToHome()} wide={true} minWidth={160} background="#B0B5BD" />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
