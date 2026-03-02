import { Button, Text, ZStack } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.1.4 [物理邊界與 iOS 配色標校]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle, 
    minWidth, height, fontSize, onTapGesture, functional = false
  } = props;

  // 🧪 物理對位：適配 260pt 高度畫布的黃金比例
  const finalWidth = minWidth ?? (wide ? 180 : 34); 
  const finalHeight = height ?? 44; 

  // iOS 標準配色標校
  const DEFAULT_BG = functional ? "rgba(172, 179, 187, 1)" : "rgba(255, 255, 255, 1)";
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
      clipShape={{ type: 'rect', cornerRadius: 5 }} // iOS 鍵盤圓角較小，約 5-6pt
      shadow={{ color: 'rgba(0,0,0,0.3)', radius: 0, y: 1 }} // 物理影深感
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
