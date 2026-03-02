import {
  Text,
  HStack,
  VStack,
  Button,
  Spacer,
  Image,
} from "scripting";

import { useStore } from "./store";
import { KeyView } from "./components/Key";
import { encode, decode, MARKER } from "./utils/cipher";

// ⚠️ 全域命名空間宣告，避免 import 報錯
declare const CustomKeyboard: any;
declare const Pasteboard: any;
declare const Clipboard: any;
declare const HapticFeedback: any;

export default function MainView() {
  const { debugMsg, updateDebugMsg, decodedContent, updateDecodedContent } = useStore();

  const handleEncode = () => {
    try {
      if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
      else if (typeof CustomKeyboard !== 'undefined' && CustomKeyboard.playInputClick) CustomKeyboard.playInputClick();

      const currentText = CustomKeyboard.allText;
      if (!currentText) {
        updateDebugMsg("無內容可隱入");
        return;
      }
      
      // 改良型替換邏輯：先插入暗號，不執行危險的刪除迴圈
      const cipher = encode(currentText);
      
      // 模擬刪除（僅嘗試刪除少數次，避免腳本掛起）
      for(let i = 0; i < 5; i++) {
        if (CustomKeyboard.hasText) CustomKeyboard.deleteBackward();
      }
      
      CustomKeyboard.insertText(cipher);
      updateDebugMsg("暗號已就緒 🦞");
    } catch (e) {
      updateDebugMsg("編碼失敗: " + (e as Error).message);
    }
  };

  const handleDecode = async () => {
    try {
      if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
      else if (typeof CustomKeyboard !== 'undefined' && CustomKeyboard.playInputClick) CustomKeyboard.playInputClick();

      let clip: string | null = null;
      try {
        clip = await Pasteboard.getString();
      } catch (e) {
        clip = await Clipboard.getString();
      }

      if (!clip || !clip.includes(MARKER)) {
        updateDebugMsg("未發現龍蝦暗號");
        return;
      }
      
      const result = decode(clip);
      updateDecodedContent(result);
      updateDebugMsg("真相大白 👁️");
    } catch (e) {
      updateDebugMsg("解碼失敗");
    }
  };

  const clearInput = () => {
    if (typeof CustomKeyboard !== 'undefined' && CustomKeyboard.playInputClick) CustomKeyboard.playInputClick();
    let limit = 20; // 限制連退回數，防止死迴圈
    while(CustomKeyboard.hasText && limit > 0) {
      CustomKeyboard.deleteBackward();
      limit--;
    }
  };

  return (
    <VStack spacing={0} background="systemBackground" frame={{ height: 300 }}>
      {/* 龍蝦鍵盤 Header - 物理鎖定 44pt */}
      <HStack padding={{ horizontal: 16 }} frame={{ height: 44 }} background="secondarySystemBackground">
        <Image systemName="shield.lefthalf.filled" font={{ size: 14, name: "system" }} foregroundStyle="systemOrange" />
        <Text font={{ size: 13, name: "system-bold" }}> 龍蝦隱寫術 v1.3.4 </Text>
        <Spacer />
        <Text font={{ size: 10, name: "system" }} foregroundStyle="secondaryLabel">{debugMsg}</Text>
      </HStack>

      <VStack spacing={15} padding={16} frame={{ maxWidth: "infinity" }}>
        
        {/* 主要操作區域 */}
        <HStack spacing={12}>
           <KeyView 
              title="🦞 隱入塵煙" 
              subtitle="加密並插入" 
              action={handleEncode} 
              wide={true} 
              background="rgba(255, 69, 0, 0.1)" 
              foregroundStyle="systemOrange" 
           />
           <KeyView 
              title="👁️ 洞穿真相" 
              subtitle="解析剪貼簿" 
              action={handleDecode} 
              wide={true} 
              background="rgba(0, 122, 255, 0.1)" 
              foregroundStyle="systemBlue" 
           />
        </HStack>

        {/* 解碼顯示區域 */}
        {decodedContent ? (
          <VStack 
            background="secondarySystemBackground" 
            padding={12} 
            alignment="leading" 
            frame={{ maxWidth: "infinity" }}
          >
             <Text font={{ size: 10, name: "system-bold" }} foregroundStyle="secondaryLabel">解碼內容：</Text>
             <Text font={{ size: 14, name: "system" }} padding={{ top: 2 }}>{decodedContent}</Text>
          </VStack>
        ) : null}

        <Spacer />

        {/* 底部導航區域 - 物理鎖定 44pt */}
        <HStack spacing={10} frame={{ height: 44 }}>
           <Button action={clearInput} buttonStyle="plain">
              <HStack 
                padding={{ horizontal: 12 }} 
                background="rgba(255,0,0,0.05)" 
                frame={{ height: 36 }}
              >
                <Image systemName="trash" font={{ size: 12, name: "system" }} foregroundStyle="systemRed" />
                <Text font={{ size: 12, name: "system" }} foregroundStyle="systemRed" padding={{ leading: 4 }}> 清除 </Text>
              </HStack>
           </Button>
           <Spacer />
           <Button action={() => { CustomKeyboard.dismissToHome(); }} buttonStyle="plain">
              <HStack 
                padding={{ horizontal: 12 }} 
                background="secondarySystemBackground" 
                frame={{ height: 36 }}
              >
                 <Image systemName="house" font={{ size: 12, name: "system" }} />
                 <Text font={{ size: 12, name: "system" }} padding={{ leading: 4 }}> 返回清單 </Text>
              </HStack>
           </Button>
           <Button action={() => { CustomKeyboard.nextKeyboard(); }} buttonStyle="plain">
              <HStack 
                padding={{ horizontal: 12 }} 
                background="secondarySystemBackground" 
                frame={{ height: 36 }}
              >
                 <Image systemName="globe" font={{ size: 12, name: "system" }} />
                 <Text font={{ size: 12, name: "system" }} padding={{ leading: 4 }}> 下一個 </Text>
              </HStack>
           </Button>
        </HStack>

      </VStack>
    </VStack>
  );
}
