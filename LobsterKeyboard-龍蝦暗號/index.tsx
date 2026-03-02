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

// ⚠️ 全域物理聲明：解決全域命名空間衝突
declare const CustomKeyboard: any;
declare const Pasteboard: any;
declare const Clipboard: any;

/**
 * 龍蝦暗號 v1.7.2 [物理擴張與佈局鎖定]
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
    try { 
      clip = await (typeof Pasteboard !== 'undefined' ? Pasteboard.getString() : Clipboard.getString()); 
    } catch (e) {}

    if (!clip || !clip.includes(MARKER)) {
      setDebugMsg("未發現暗號");
      return;
    }
    const result = decode(clip);
    setDecodedContent(result);
    setDebugMsg("解碼完成 👁️");
  };

  return (
    <VStack spacing={0} background="#D1D3D9" frame={{ maxWidth: "infinity", height: 220 }}>
      {/* 🔮 龍蝦 Toolbar (38pt) */}
      <HStack padding={{ horizontal: 10 }} frame={{ height: 38 }} background="#F8F8F8">
        <Image systemName="shield.lefthalf.filled" font={{ size: 12, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 11, name: "system-bold" }}> 龍蝦隱寫 v1.7.2 </Text>
        <Spacer />
        <Text font={{ size: 9, name: "system" }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        <Button action={() => setMode(mode === 0 ? 1 : 0)} buttonStyle="plain">
          <HStack 
            padding={{horizontal: 8, vertical: 4}} 
            background={mode === 0 ? "#E0E0E0" : "systemOrange"} 
            clipShape={{ type: 'rect', cornerRadius: 6 }}
          >
             <Text font={{ size: 11, name: "system-bold" }} foregroundStyle={mode === 0 ? "black" : "white"}>
               {mode === 0 ? "特工模式" : "打字模式"}
             </Text>
          </HStack>
        </Button>
      </HStack>

      {/* ⌨️ 鍵盤主體佈局 - 寬度自動適配，間距鎖定 */}
      <VStack spacing={6} padding={{ top: 8, leading: 4, trailing: 4, bottom: 4 }} frame={{ maxWidth: "infinity" }}>
        {mode === 0 ? (
          /* 🅰️ 改良型 QWERTY 佈局 (3+3+3+4 物理模式) */
          <VStack spacing={8} alignment="center">
            {/* 第一排 10 鍵 */}
            <RowView chars="Q W E R T Y U I O P" spacing={4} />
            
            {/* 第二排 9 鍵 */}
            <RowView chars="A S D F G H J K L" spacing={4} />
            
            {/* 第三排 7 鍵 + Shift/Delete */}
            <HStack spacing={4} alignment="center">
              <KeyView 
                title="⇧" 
                minWidth={40} 
                height={40} 
                action={() => setCapsState(capsState === 0 ? 1 : 0)} 
                background={capsState !== 0 ? "systemBlue" : "#B0B5BD"} 
                foregroundStyle={capsState !== 0 ? "white" : "black"} 
              />
              <RowView chars="Z X C V B N M" spacing={4} />
              <KeyView 
                title="⌫" 
                minWidth={40} 
                height={40} 
                background="#B0B5BD" 
                action={() => CustomKeyboard.deleteBackward()} 
              />
            </HStack>
            
            {/* 第四排 底部控制 (EN/ZH, Space, Return, Globe) */}
            <HStack spacing={6} alignment="center">
              <KeyView 
                title={lang === 0 ? "中" : "EN"} 
                minWidth={44} 
                height={40} 
                background="#B0B5BD" 
                action={() => setLang(lang === 0 ? 1 : 0)} 
              />
              <KeyView 
                title="space" 
                wide={true} 
                minWidth={150} 
                height={40} 
                action={() => CustomKeyboard.insertText(" ")} 
              />
              <KeyView 
                title="換行" 
                minWidth={50} 
                height={40} 
                background="#B0B5BD" 
                fontSize={12} 
                action={() => CustomKeyboard.insertText("\n")} 
              />
              <Button action={() => CustomKeyboard.nextKeyboard()} buttonStyle="plain">
                <ZStack 
                  background="#B0B5BD" 
                  clipShape={{ type: 'rect', cornerRadius: 5 }}
                  frame={{width: 40, height: 40}}
                >
                  <Image systemName="globe" font={{size: 18, name: "system"}} foregroundStyle="black"/>
                </ZStack>
              </Button>
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工面板 - 空間補強 */
          <VStack spacing={12} padding={6}>
            <HStack spacing={10}>
               <KeyView title="🦞 隱入塵煙" action={handleEncode} wide={true} minWidth={160} background="rgba(255, 69, 0, 0.1)" foregroundStyle="systemOrange" height={55} />
               <KeyView title="👁️ 洞穿真相" action={handleDecode} wide={true} minWidth={160} background="rgba(0, 122, 255, 0.1)" foregroundStyle="systemBlue" height={55} />
            </HStack>
            <ZStack 
              background="white" 
              clipShape={{ type: 'rect', cornerRadius: 8 }}
              frame={{ maxWidth: "infinity", height: 60 }}
            >
              {decodedContent ? (
                <ScrollView padding={8}><Text font={{ size: 14, name: "system" }}>{decodedContent}</Text></ScrollView>
              ) : (
                <VStack alignment="center" opacity={0.3}><Image systemName="waveform.path.ecg" font={{size: 20, name: "system"}}/></VStack>
              )}
            </ZStack>
            <HStack spacing={10}>
               <KeyView title="清除" action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } }} minWidth={100} height={40} background="#B0B5BD" foregroundStyle="red" />
               <Spacer />
               <KeyView title="返回主單" action={() => CustomKeyboard.dismissToHome()} minWidth={100} height={40} background="#B0B5BD" />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
