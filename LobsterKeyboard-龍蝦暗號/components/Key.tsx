import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.9.3 [終極寬度標校版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "label", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理修正：將標準字母鍵基準寬度提升至 42pt
  // 在 10 個鍵位的情況下，這是大多數 iOS 螢幕橫向飽滿感的黃金比例
  const finalWidth = minWidth ?? (wide ? 220 : 42); 
  const finalHeight = height ?? 44; 
  
  const finalBackground = background ?? "rgba(255, 255, 255, 0.9)";

  return <Button
    action={handleAction}
    buttonStyle="plain"
  >
    <ZStack 
      background={finalBackground} 
      clipShape={{ type: 'rect', cornerRadius: 8 }}
      frame={{ width: finalWidth, height: finalHeight }}
      shadow={{ color: 'rgba(0,0,0,0.1)', radius: 0.2, y: 1.2 }}
    >
      <VStack alignment="center">
        <Spacer />
        <Text 
          font={{ size: fontSize ?? 20, name: "system" }} 
          foregroundStyle={foregroundStyle}
        >
          {title}
        </Text>
        <Spacer />
      </VStack>
    </ZStack>
  </Button>
}
