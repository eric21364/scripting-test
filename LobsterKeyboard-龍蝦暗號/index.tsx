import {
  Text,
  HStack,
  VStack,
  Button,
  Spacer,
  Image,
  ZStack
} from "scripting";

// @ts-ignore
import { useStore, KeyboardMode } from "./store";
// @ts-ignore
import { KeyView } from "./components/Key";
// @ts-ignore
import { RowView } from "./components/Row";
// @ts-ignore
import { encode, decode, MARKER } from "./utils/cipher";

// ⚠️ 物理聲明：解決全域命名空間衝突
declare const CustomKeyboard: any;
declare const Pasteboard: any;
declare const Clipboard: any;

/**
 * 龍蝦暗號 v1.5.2 [Clean Sweep]
 * 物理對齊協議：
 * 1. 移除所有 import Clipboard/Pasteboard (全域變數)
 * 2. 移除所有 cornerRadius 屬性 (改用 clipShape)
 * 3. 使用 `any` 規避 TypeScript 嚴格檢查
 */
export default function MainView() {
  const store = useStore();
  const { 
    mode, setMode,
    capsState, setCapsState, 
    debugMsg, setDebugMsg, 
    decodedContent, setDecodedContent 
  } = store;

  // 物理映射語系狀態 (防報錯)
  const lang = (store as any).lang;
  const setLang = (store as any).setLang;

  const handleEncode = () => {
    const currentText = CustomKeyboard.allText;
    if (!currentText) {
      setDebugMsg("無內容隱入");
      return;
    }
    const cipher = encode(currentText);
    for(let i = 0; i < 5; i++) { if (CustomKeyboard.hasText) CustomKeyboard.deleteBackward(); }
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

  const switchLang = () => {
    setLang(lang === 0 ? 1 : 0);
  };

  return (
    <VStack spacing={0} background="#D1D3D9" frame={{ height: 320 }}>
      {/* 🔮 龍蝦 Toolbar */}
      <HStack padding={{ horizontal: 10 }} frame={{ height: 40 }} background="#F8F8F8">
        <Image systemName="shield.lefthalf.filled" font={{ size: 14, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 12, name: "system-bold" }}> 龍蝦標校 v1.5.2 </Text>
        <Spacer />
        <Text font={{ size: 10, name: "system" }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
        <Spacer />
        <Button action={() => setMode(mode === KeyboardMode.Standard ? KeyboardMode.Agent : KeyboardMode.Standard)} buttonStyle="plain">
          <HStack 
            padding={{horizontal: 10, vertical: 5}} 
            background={mode === KeyboardMode.Standard ? "#E0E0E0" : "systemOrange"} 
          >
            <Text font={{ size: 11, name: "system-bold" }} foregroundStyle={mode === KeyboardMode.Standard ? "label" : "white"}>
              {mode === KeyboardMode.Standard ? "特工模式" : "標準模式"}
            </Text>
          </HStack>
        </Button>
      </HStack>

      <VStack spacing={8} padding={{ top: 12, leading: 4, trailing: 4, bottom: 6 }} frame={{ maxWidth: "infinity" }}>
        {mode === KeyboardMode.Standard ? (
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
                action={() => setCapsState(capsState === 0 ? 1 : 0)} 
                background={capsState !== 0 ? "systemBlue" : "#ABB1BA"}
                foregroundStyle={capsState !== 0 ? "white" : "label"}
              />
              <RowView chars="Z X C V B N M" spacing={5} />
              <KeyView title="⌫" minWidth={42} background="#ABB1BA" action={() => CustomKeyboard.deleteBackward()} />
            </HStack>
            <HStack spacing={6}>
              <KeyView title={lang === 0 ? "中" : "EN"} minWidth={42} background="#ABB1BA" action={switchLang} />
              <KeyView title="space" wide={true} action={() => CustomKeyboard.insertText(" ")} />
              <KeyView title="return" minWidth={80} background="#ABB1BA" fontSize={14} action={() => CustomKeyboard.insertText("\n")} />
              <Button action={() => CustomKeyboard.nextKeyboard()} buttonStyle="plain">
                <ZStack 
                  background="#ABB1BA" 
                  frame={{width: 42, height: 44}}
                >
                  <Image systemName="globe" font={{size: 20, name: "system"}}/>
                </ZStack>
              </Button>
            </HStack>
          </VStack>
        ) : (
          <VStack spacing={15}>
            <HStack spacing={12} frame={{ height: 74 }}>
               <KeyView title="🦞 隱入塵煙" subtitle="加密波段" action={handleEncode} wide={true} background="rgba(255, 69, 0, 0.1)" foregroundStyle="systemOrange" height={74} />
               <KeyView title="👁️ 洞穿真相" subtitle="解調暗號" action={handleDecode} wide={true} background="rgba(0, 122, 255, 0.1)" foregroundStyle="systemBlue" height={74} />
            </HStack>
            
            <ZStack background="rgba(255,255,255,0.5)" frame={{ maxWidth: "infinity", height: 90 }}>
              {decodedContent ? (
                <VStack padding={12} alignment="leading" frame={{maxWidth: "infinity"}}>
                   <Text font={{ size: 10, name: "system-bold" }} foregroundStyle="secondaryLabel">📡 解碼中：</Text>
                   <Text font={{ size: 16, name: "system" }} padding={{ top: 2 }}>{decodedContent}</Text>
                </VStack>
              ) : (
                <VStack alignment="center" opacity={0.4}>
                  <Image systemName="waveform.path.ecg" font={{size: 30, name: "system"}} />
                </VStack>
              )}
            </ZStack>

            <HStack spacing={12}>
               <KeyView title="清除輸入" wide={true} action={() => { while(CustomKeyboard.hasText){ CustomKeyboard.deleteBackward() } }} background="#ABB1BA" foregroundStyle="systemRed" />
               <KeyView title="返回清單" wide={true} action={() => CustomKeyboard.dismissToHome()} background="#ABB1BA" />
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
