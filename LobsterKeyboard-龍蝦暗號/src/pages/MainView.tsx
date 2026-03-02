import {
  Text,
  HStack,
  VStack,
  Button,
  Spacer,
  Image,
  useState,
  Clipboard,
  CustomKeyboard
} from "scripting";

import { MARKER, encode, decode } from "../utils/cipher";

export default function MainView() {
  const [debugMsg, setDebugMsg] = useState("等待波段中...");
  const [decodedContent, setDecodedContent] = useState("");

  const handleEncode = () => {
    CustomKeyboard.playInputClick();
    const currentText = CustomKeyboard.allText;
    if (!currentText) {
      setDebugMsg("目前無波段可隱入");
      return;
    }
    
    // 物理清理當前輸入
    while(CustomKeyboard.hasText) {
      CustomKeyboard.deleteBackward();
    }
    
    const cipher = encode(currentText);
    CustomKeyboard.insertText(cipher);
    setDebugMsg("暗號已就緒 🦞");
  };

  const handleDecode = async () => {
    CustomKeyboard.playInputClick();
    const clip = await Clipboard.getString();
    if (!clip || !clip.includes(MARKER)) {
      setDebugMsg("剪貼簿無龍蝦暗號");
      return;
    }
    
    const result = decode(clip);
    setDecodedContent(result);
    setDebugMsg("洞穿真相完成 👁️");
  };

  const clearInput = () => {
    CustomKeyboard.playInputClick();
    while(CustomKeyboard.hasText) {
      CustomKeyboard.deleteBackward();
    }
  };

  return (
    <VStack spacing={0} background="systemBackground" frame={{ height: 300 }}>
      {/* 龍蝦鍵盤 Header - 物理鎖定 44pt */}
      <HStack padding={{ horizontal: 16 }} frame={{ height: 44 }} background="secondarySystemBackground">
        <Image systemName="shield.lefthalf.filled" font={14} foregroundStyle="systemOrange" />
        <Text font={{ size: 13, name: "system-bold" }}> 龍蝦隱寫術 v1.1 </Text>
        <Spacer />
        <Text font={{ size: 10 }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
      </HStack>

      <VStack spacing={15} padding={16} frame={{ maxWidth: "infinity" }}>
        
        {/* 主要操作區域 */}
        <HStack spacing={12} frame={{ height: 54 }}>
           <Button action={handleEncode} buttonStyle="plain" frame={{ maxWidth: "infinity", height: "infinity" }}>
              <VStack background="rgba(255, 69, 0, 0.1)" cornerRadius={12} frame={{ maxWidth: "infinity", height: "infinity" }} alignment="center">
                 <Spacer />
                 <Text font={{ size: 14, name: "system-bold" }} foregroundStyle="systemOrange">🦞 隱入塵煙</Text>
                 <Text font={{ size: 9 }} foregroundStyle="secondaryLabel">加密當前輸入</Text>
                 <Spacer />
              </VStack>
           </Button>

           <Button action={handleDecode} buttonStyle="plain" frame={{ maxWidth: "infinity", height: "infinity" }}>
              <VStack background="rgba(0, 122, 255, 0.1)" cornerRadius={12} frame={{ maxWidth: "infinity", height: "infinity" }} alignment="center">
                 <Spacer />
                 <Text font={{ size: 14, name: "system-bold" }} foregroundStyle="systemBlue">👁️ 洞穿真相</Text>
                 <Text font={{ size: 9 }} foregroundStyle="secondaryLabel">讀取剪貼簿暗號</Text>
                 <Spacer />
              </VStack>
           </Button>
        </HStack>

        {/* 解碼顯示區域 */}
        {decodedContent.length > 0 && (
          <VStack background="secondarySystemBackground" cornerRadius={10} padding={12} alignment="leading" frame={{ maxWidth: "infinity" }}>
             <Text font={{ size: 10, name: "system-bold" }} foregroundStyle="secondaryLabel">解碼內容：</Text>
             <Text font={{ size: 14 }} padding={{ top: 2 }}>{decodedContent}</Text>
          </VStack>
        )}

        <Spacer />

        {/* 底部導航區域 - 物理鎖定 44pt */}
        <HStack spacing={10} frame={{ height: 44 }}>
           <Button action={clearInput} buttonStyle="plain">
              <HStack padding={{ horizontal: 12 }} background="rgba(255,0,0,0.05)" cornerRadius={8} frame={{ height: 36 }}>
                <Image systemName="trash" font={12} foregroundStyle="systemRed" />
                <Text font={{ size: 12 }} foregroundStyle="systemRed" padding={{ leading: 4 }}> 清除 </Text>
              </HStack>
           </Button>
           <Spacer />
           <Button action={() => CustomKeyboard.dismissToHome()} buttonStyle="plain">
              <HStack padding={{ horizontal: 12 }} background="secondarySystemBackground" cornerRadius={8} frame={{ height: 36 }}>
                 <Image systemName="house" font={12} />
                 <Text font={{ size: 12 }} padding={{ leading: 4 }}> 返回清單 </Text>
              </HStack>
           </Button>
           <Button action={() => CustomKeyboard.nextKeyboard()} buttonStyle="plain">
              <HStack padding={{ horizontal: 12 }} background="secondarySystemBackground" cornerRadius={8} frame={{ height: 36 }}>
                 <Image systemName="globe" font={12} />
                 <Text font={{ size: 12 }} padding={{ leading: 4 }}> 下一個 </Text>
              </HStack>
           </Button>
        </HStack>

      </VStack>
    </VStack>
  );
}
