import { Button, Text, ZStack } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.1.2 [物理邊界擴張與 iOS 質感重繪]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", 
    minWidth, height, fontSize, onTapGesture
  } = props;

  // 🧪 物理對位：標準寬度與高度適配 260pt 畫布
  const finalWidth = minWidth ?? (wide ? 180 : 34); 
  const finalHeight = height ?? 44; 

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
      background={background ?? "systemSecondaryBackground"}
      clipShape={{ type: 'rect', cornerRadius: 8 }}
      shadow={{ color: 'rgba(0,0,0,0.25)', radius: 1, y: 1.5 }}
      frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
    >
      <Text 
        font={{ size: fontSize ?? 18, name: "system" }}
        fontWeight="medium"
        foregroundStyle={foregroundStyle === "black" ? "label" : foregroundStyle}
      >
        {title}
      </Text>
    </ZStack>
  </Button>
}
