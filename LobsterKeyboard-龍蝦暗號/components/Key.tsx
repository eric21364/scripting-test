import { Button, Text, ZStack } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.1.6 [iOS 原生實體感標校]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle, 
    minWidth, height, fontSize, onTapGesture, functional = false
  } = props;

  // 🧪 物理對位：適配原生 iOS 比例
  const finalWidth = minWidth ?? (wide ? 180 : 34); 
  const finalHeight = height ?? 44; 

  // iOS 標準物理配色標校
  // 字元鍵: 純白 | 功能鍵: 灰藍色 (rgba(172, 179, 188, 1))
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
    <ZStack 
      background={background ?? DEFAULT_BG}
      clipShape={{ type: 'rect', cornerRadius: 5 }} 
      // 🧪 物理影深標校：radius: 0 產生實體感，y: 1.2 模擬厚度
      shadow={{ color: 'rgba(0,0,0,0.35)', radius: 0, y: 1.2 }} 
      frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
    >
      <Text 
        font={{ size: fontSize ?? 20, name: "system" }}
        fontWeight="regular"
        foregroundStyle={foregroundStyle ?? DEFAULT_TEXT}
      >
        {title}
      </Text>
    </ZStack>
  </Button>
}
