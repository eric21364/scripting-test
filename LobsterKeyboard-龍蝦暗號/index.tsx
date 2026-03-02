import {
  Text,
  HStack,
  VStack,
  Button,
  Spacer,
  Image,
  Clipboard,
  Pasteboard,
} from "scripting";

import { useStore, KeyboardMode, CapsState } from "./store";
import { KeyView } from "./components/Key";
import { RowView } from "./components/Row";
import { encode, decode, MARKER } from "./utils/cipher";

declare const CustomKeyboard: any;
declare const HapticFeedback: any;

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
      setDebugMsg("無波段隱入");
      return;
    }
    const cipher = encode(currentText);
    for(let i = 0; i < 5; i++) { if (CustomKeyboard.hasText) CustomKeyboard.deleteBackward(); }
    CustomKeyboard.insertText(cipher);
    setDebugMsg("暗號就緒 🦞");
  };

  const handleDecode = async () => {
    let clip: string | null = null;
    try { clip = await (typeof Pasteboard !== 'undefined' ? Pasteboard.getString() : Clipboard.getString()); } catch (e) {}

    if (!clip || !clip.includes(MARKER)) {
      setDebugMsg("無龍蝦暗號");
      return;
    }
    const result = decode(clip);
    setDecodedContent(result);
    setDebugMsg("洞穿完成 👁️");
  };

  return (
    <VStack spacing={0} background="#D1D3D9" frame={{ height: 320 }}>
      {/* 龍蝦 ToolBar */}
      <HStack padding={{ horizontal: 10 }} frame={{ height: 40 }} background="#F8F8F8">
        <Image systemName="shield.lefthalf.filled" font={{ size: 12, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 12, name: "system-bold" }}> 龍蝦隱寫 v1.4 </Text>
        <Spacer />
        <Text font={{ size: 9, name: "system" }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        <Button action={() => setMode(mode === KeyboardMode.Standard ? KeyboardMode.Agent : KeyboardMode.Standard)} buttonStyle="plain">
          <HStack padding={{horizontal: 10, vertical: 4}} background="rgba(0,0,0,0.05)" cornerRadius={6}>
            <Text font={{ size: 11, name: "system-bold" }}>{mode === KeyboardMode.Standard ? "特工模式" : "標準打字"}</Text>
          </HStack>
        </Button>
      </HStack>

      <VStack spacing={8} padding={8} frame={{ maxWidth: "infinity" }}>
        {mode === KeyboardMode.Standard ? (
          /* 標準 QWERTY 佈局 */
          <VStack spacing={10}>
            <RowView chars="Q W E R T Y U I O P" />
            <RowView chars="A S D F G H J K L" />
            <HStack spacing={6}>
              <KeyView 
                title="⇪" 
                action={() => setCapsState(capsState === CapsState.Off ? CapsState.On : CapsState.Off)} 
                background={capsState !== CapsState.Off ? "systemBlue" : "systemBackground"}
                foregroundStyle={capsState !== CapsState.Off ? "white" : "label"}
              />
              <RowView chars="Z X C V B N M" />
              <KeyView title="⌫" minWidth={45} action={() => CustomKeyboard.deleteBackward()} />
            </HStack>
            <HStack spacing={6}>
              <KeyView title="123" minWidth={45} action={() => {}} />
              <KeyView title="space" wide={true} action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="⏎" minWidth={45} action={() => CustomKeyboard.insertText("\n")} />
              <Button action={() => CustomKeyboard.nextKeyboard()} buttonStyle="plain">
                <ZStack background="systemBackground" cornerRadius={5} frame={{width: 40, height: 44}}><Image systemName="globe" font={{size: 16, name: "system"}}/></ZStack>
              </Button>
            </HStack>
          </VStack>
        ) : (
          /* 特工加解密模式 */
          <VStack spacing={15}>
            <HStack spacing={12} frame={{ height: 60 }}>
               <KeyView title="🦞 隱入塵煙" subtitle="加密輸入" action={handleEncode} wide={true} background="rgba(255, 69, 0, 0.1)" foregroundStyle="systemOrange" height={60} />
               <KeyView title="👁️ 洞穿真相" subtitle="解析剪貼" action={handleDecode} wide={true} background="rgba(0, 122, 255, 0.1)" foregroundStyle="systemBlue" height={60} />
            </HStack>
            {decodedContent ? (
              <VStack background="systemBackground" cornerRadius={10} padding={12} alignment="leading" frame={{ maxWidth: "infinity", height: 80 }}>
                 <Text font={{ size: 10, name: "system-bold" }} foregroundStyle="secondaryLabel">解碼內容：</Text>
                 <Text font={{ size: 14, name: "system" }} padding={{ top: 2 }}>{decodedContent}</Text>
              </VStack>
            ) : (
              <VStack alignment="center" frame={{ height: 80 }} opacity={0.3}>
                <Image systemName="waveform.path.ecg" font={{size: 30, name: "system"}} />
                <Text font={{size: 10, name: "system"}}>波段監聽中...</Text>
              </VStack>
            )}
            <HStack spacing={10}>
               <KeyView title="清除輸入" minWidth={100} action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } }} background="rgba(255,0,0,0.05)" foregroundStyle="systemRed" />
               <Spacer />
               <KeyView title="返回主頁" minWidth={100} action={() => CustomKeyboard.dismissToHome()} />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
