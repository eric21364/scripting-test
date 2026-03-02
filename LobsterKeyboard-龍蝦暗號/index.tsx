import {
  Text,
  HStack,
  VStack,
  Button,
  Spacer,
  Image,
  Clipboard,
  Pasteboard,
  ZStack
} from "scripting";

import { useStore, KeyboardMode, CapsState } from "./store";
import { KeyView } from "./components/Key";
import { RowView } from "./components/Row";
import { encode, decode, MARKER } from "./utils/cipher";

declare const CustomKeyboard: any;

export default function MainView() {
  const { 
    mode, setMode, 
    capsState, setCapsState, 
    debugMsg, setDebugMsg, 
    decodedContent, setDecodedContent 
  } = useStore();

  const handleEncode = () => {
    const currentText = CustomKeyboard.allText;
    if (!currentText) {
      setDebugMsg("無內容可隱入");
      return;
    }
    const cipher = encode(currentText);
    for(let i = 0; i < 5; i++) { if (CustomKeyboard.hasText) CustomKeyboard.deleteBackward(); }
    CustomKeyboard.insertText(cipher);
    setDebugMsg("暗號已就緒 🦞");
  };

  const handleDecode = async () => {
    let clip: string | null = null;
    try { clip = await (typeof Pasteboard !== 'undefined' ? Pasteboard.getString() : Clipboard.getString()); } catch (e) {}

    if (!clip || !clip.includes(MARKER)) {
      setDebugMsg("剪貼簿無暗號");
      return;
    }
    const result = decode(clip);
    setDecodedContent(result);
    setDebugMsg("洞穿真相 👁️");
  };

  return (
    <VStack spacing={0} background="#D1D3D9" frame={{ height: 320 }}>
      {/* 🔮 龍蝦特工工具列 (40pt) */}
      <HStack padding={{ horizontal: 10 }} frame={{ height: 40 }} background="#F0F0F0">
        <Image systemName="shield.lefthalf.filled" font={{ size: 14, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 13, name: "system-bold" }}> 龍蝦暗號 v1.4.1 </Text>
        <Spacer />
        <Text font={{ size: 10, name: "system" }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        {/* 切換按鈕：具備實體感的切換介面 */}
        <Button action={() => setMode(mode === KeyboardMode.Standard ? KeyboardMode.Agent : KeyboardMode.Standard)} buttonStyle="plain">
          <HStack padding={{horizontal: 10, vertical: 5}} background={mode === KeyboardMode.Standard ? "#E0E0E0" : "systemOrange"} cornerRadius={8}>
            <Image systemName={mode === KeyboardMode.Standard ? "lock.shield" : "keyboard"} font={{size: 12, name: "system"}} foregroundStyle={mode === KeyboardMode.Standard ? "label" : "white"} />
            <Text font={{ size: 11, name: "system-bold" }} foregroundStyle={mode === KeyboardMode.Standard ? "label" : "white"}>
              {mode === KeyboardMode.Standard ? "特工模式" : "標準模式"}
            </Text>
          </HStack>
        </Button>
      </HStack>

      {/* ⌨️ 面板區域：根據模式切換佈局 */}
      <VStack spacing={8} padding={{ top: 12, leading: 6, trailing: 6, bottom: 6 }} frame={{ maxWidth: "infinity" }}>
        {mode === KeyboardMode.Standard ? (
          /* 🅰️ 標準 QWERTY 全對位佈局 */
          <VStack spacing={12}>
            <RowView chars="Q W E R T Y U I O P" spacing={6} />
            <HStack spacing={6}>
              <Spacer />
              <RowView chars="A S D F G H J K L" spacing={6} />
              <Spacer />
            </HStack>
            <HStack spacing={6}>
              <KeyView 
                title="⇪" 
                minWidth={44}
                action={() => setCapsState(capsState === CapsState.Off ? CapsState.On : CapsState.Off)} 
                background={capsState !== CapsState.Off ? "systemBlue" : "secondarySystemBackground"}
                foregroundStyle={capsState !== CapsState.Off ? "white" : "label"}
              />
              <RowView chars="Z X C V B N M" spacing={6} />
              <KeyView title="⌫" minWidth={44} background="#ABB1BA" action={() => CustomKeyboard.deleteBackward()} />
            </HStack>
            <HStack spacing={6}>
              <KeyView title="123" minWidth={45} background="#ABB1BA" action={() => {}} />
              <KeyView title="space" wide={true} action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="⏎" minWidth={80} background="#ABB1BA" action={() => CustomKeyboard.insertText("\n")} />
              <Button action={() => CustomKeyboard.nextKeyboard()} buttonStyle="plain">
                <ZStack background="#ABB1BA" cornerRadius={5} frame={{width: 44, height: 44}}><Image systemName="globe" font={{size: 20, name: "system"}}/></ZStack>
              </Button>
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工專屬 UI：大型功能按鈕 */
          <VStack spacing={15}>
            <HStack spacing={12} frame={{ height: 74 }}>
               <KeyView 
                  title="🦞 隱入塵煙" 
                  subtitle="加密當前文字波段" 
                  action={handleEncode} 
                  wide={true} 
                  background="rgba(255, 69, 0, 0.1)" 
                  foregroundStyle="systemOrange" 
                  height={74} 
               />
               <KeyView 
                  title="👁️ 洞穿真相" 
                  subtitle="解讀剪貼簿暗號內容" 
                  action={handleDecode} 
                  wide={true} 
                  background="rgba(0, 122, 255, 0.1)" 
                  foregroundStyle="systemBlue" 
                  height={74} 
               />
            </HStack>
            
            {/* 動態顯示解碼結果 */}
            <ZStack background="rgba(0,0,0,0.03)" cornerRadius={12} frame={{ maxWidth: "infinity", height: 90 }}>
              {decodedContent ? (
                <VStack padding={12} alignment="leading" frame={{maxWidth: "infinity"}}>
                   <Text font={{ size: 10, name: "system-bold" }} foregroundStyle="secondaryLabel">📡 偵測到波段訊息：</Text>
                   <Text font={{ size: 16, name: "system" }} padding={{ top: 4 }}>{decodedContent}</Text>
                </VStack>
              ) : (
                <VStack alignment="center" opacity={0.3} spacing={8}>
                  <Image systemName="waveform.path.ecg" font={{size: 32, name: "system"}} foregroundStyle="secondaryLabel" />
                  <Text font={{size: 10, name: "system"}}>波段監聽中...</Text>
                </VStack>
              )}
            </ZStack>

            <HStack spacing={12}>
               <KeyView title="清除輸入" wide={true} action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } }} background="#ABB1BA" foregroundStyle="systemRed" />
               <KeyView title="返回主頁" wide={true} action={() => CustomKeyboard.dismissToHome()} background="#ABB1BA" />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
