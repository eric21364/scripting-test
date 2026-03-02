import {
  Text,
  HStack,
  VStack,
  Button,
  Spacer,
  Image,
  ZStack
} from "scripting";

import { useStore, KeyboardMode, KeyboardLang, CapsState } from "./store";
import { KeyView } from "./components/Key";
import { RowView } from "./components/Row";
import { encode, decode, MARKER } from "./utils/cipher";

// ⚠️ 全域命名空間聲明
declare const CustomKeyboard: any;
declare const Pasteboard: any;
declare const Clipboard: any;

export default function MainView() {
  const { 
    mode, setMode,
    lang, setLang,
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
    setDebugMsg("暗號已就緒 🦞");
  };

  const handleDecode = async () => {
    let clip: string | null = null;
    try { 
      clip = await (typeof Pasteboard !== 'undefined' ? Pasteboard.getString() : Clipboard.getString()); 
    } catch (e) {}

    if (!clip || !clip.includes(MARKER)) {
      setDebugMsg("無暗號偵測");
      return;
    }
    const result = decode(clip);
    setDecodedContent(result);
    setDebugMsg("解碼完成 👁️");
  };

  const switchLang = () => {
    setLang(lang === KeyboardLang.EN ? KeyboardLang.ZH : KeyboardLang.EN);
  };

  return (
    <VStack spacing={0} background="#D1D3D9" frame={{ height: 320 }}>
      {/* 🔮 龍蝦 Toolbar (40pt) */}
      <HStack padding={{ horizontal: 10 }} frame={{ height: 40 }} background="#F8F8F8">
        <Image systemName="shield.lefthalf.filled" font={{ size: 14, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 12, name: "system-bold" }}> 龍蝦標校 v1.5.1 </Text>
        <Spacer />
        <Text font={{ size: 10, name: "system" }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        <Button action={() => setMode(mode === KeyboardMode.Standard ? KeyboardMode.Agent : KeyboardMode.Standard)} buttonStyle="plain">
          <HStack 
            padding={{horizontal: 10, vertical: 5}} 
            background={mode === KeyboardMode.Standard ? "#E0E0E0" : "systemOrange"} 
            clipShape={{ type: 'rect', cornerRadius: 8 }}
          >
            <Text font={{ size: 11, name: "system-bold" }} foregroundStyle={mode === KeyboardMode.Standard ? "label" : "white"}>
              {mode === KeyboardMode.Standard ? "特工模式" : "打字模式"}
            </Text>
          </HStack>
        </Button>
      </HStack>

      <VStack spacing={8} padding={{ top: 12, leading: 4, trailing: 4, bottom: 6 }} frame={{ maxWidth: "infinity" }}>
        {mode === KeyboardMode.Standard ? (
          /* 🅰️ 標準/中文 佈局 */
          <VStack spacing={10}>
            <RowView chars="Q W E R T Y U I O P" />
            <HStack spacing={6}>
              <Spacer />
              <RowView chars="A S D F G H J K L" />
              <Spacer />
            </HStack>
            <HStack spacing={4}>
              <KeyView 
                title="⇧" 
                minWidth={42}
                action={() => setCapsState(capsState === CapsState.Off ? CapsState.On : CapsState.Off)} 
                background={capsState !== CapsState.Off ? "systemBlue" : "#ABB1BA"}
                foregroundStyle={capsState !== CapsState.Off ? "white" : "label"}
              />
              <RowView chars="Z X C V B N M" spacing={5} />
              <KeyView title="⌫" minWidth={42} background="#ABB1BA" action={() => CustomKeyboard.deleteBackward()} />
            </HStack>
            <HStack spacing={6}>
              <KeyView title={lang === KeyboardLang.EN ? "中" : "EN"} minWidth={42} background="#ABB1BA" action={switchLang} />
              <KeyView title="space" wide={true} action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="return" minWidth={80} background="#ABB1BA" fontSize={14} action={() => CustomKeyboard.insertText("\n")} />
              <Button action={() => CustomKeyboard.nextKeyboard()} buttonStyle="plain">
                <ZStack 
                  background="#ABB1BA" 
                  clipShape={{ type: 'rect', cornerRadius: 6 }}
                  frame={{width: 42, height: 44}}
                >
                  <Image systemName="globe" font={{size: 20, name: "system"}}/>
                </ZStack>
              </Button>
            </HStack>
          </VStack>
        ) : (
          /* 🕵️ 特工專屬面板 */
          <VStack spacing={15}>
            <HStack spacing={12} frame={{ height: 74 }}>
               <KeyView title="🦞 隱入塵煙" subtitle="暗號編碼發送" action={handleEncode} wide={true} background="rgba(255, 69, 0, 0.1)" foregroundStyle="systemOrange" height={74} />
               <KeyView title="👁️ 洞穿真相" subtitle="剪貼簿深度解調" action={handleDecode} wide={true} background="rgba(0, 122, 255, 0.1)" foregroundStyle="systemBlue" height={74} />
            </HStack>
            
            <ZStack 
              background="rgba(255,255,255,0.5)" 
              clipShape={{ type: 'rect', cornerRadius: 12 }}
              frame={{ maxWidth: "infinity", height: 90 }}
            >
              {decodedContent ? (
                <VStack padding={12} alignment="leading" frame={{maxWidth: "infinity"}}>
                   <Text font={{ size: 10, name: "system-bold" }} foregroundStyle="secondaryLabel">📡 解碼結果：</Text>
                   <Text font={{ size: 16, name: "system" }} padding={{ top: 2 }}>{decodedContent}</Text>
                </VStack>
              ) : (
                <VStack alignment="center" opacity={0.4}>
                  <Image systemName="antenna.radiowaves.left.and.right" font={{size: 30, name: "system"}} />
                  <Text font={{size: 10, name: "system"}} padding={{top: 5}}>波段掃描中...</Text>
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
