import { Button, Text, ZStack } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.1.8 [物理範圍鎖定與 iOS 18 原生標校]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle, 
    minWidth, height, fontSize, onTapGesture, functional = false
  } = props;

  // 🧪 物理對位：確保按鍵在 375pt 標準螢幕下不溢出
  const finalWidth = minWidth ?? (wide ? 180 : 32); 
  const finalHeight = height ?? 44; 

  // iOS 18 原生配色：字元鍵純白，功能鍵灰藍
  const DEFAULT_BG = functional ? "rgba(172, 179, 188, 1)" : "rgba(255, 255, 255, 1)";
  const DEFAULT_TEXT = "label";

  return <Button
    action={() => {
      if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
      if (action) action();
    }}
    onTapGesture={onTapGesture}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    {/* 🛡️ 實體範圍鎖定：ZStack 必須與 Button frame 完全同步，確保背景填滿點擊範圍 */}
    <ZStack 
      background={background ?? DEFAULT_BG}
      frame={{ width: finalWidth, height: finalHeight }}
      clipShape={{ type: 'rect', cornerRadius: 5 }} 
      // 物理影深標校：radius: 0 模擬實體，y: 1.1 模擬厚度
      shadow={{ color: 'rgba(0,0,0,0.35)', radius: 0, y: 1.1 }} 
    >
      <Text 
        font={{ size: fontSize ?? 19, name: "system" }}
        fontWeight="regular"
        foregroundStyle={foregroundStyle ?? DEFAULT_TEXT}
      >
        {title}
      </Text>
    </ZStack>
  </Button>
}
