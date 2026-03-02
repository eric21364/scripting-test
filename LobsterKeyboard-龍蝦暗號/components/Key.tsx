import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.9.2 [物理橫向再擴張版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "label", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理對位修正：將基礎寬度提升至 40pt (極限飽滿)
  const finalWidth = minWidth ?? (wide ? 200 : 40); 
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
      shadow={{ color: 'rgba(0,0,0,0.1)', radius: 0.1, y: 1 }}
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
