import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.9 物理統一質感標校
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "label", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理標校：標準鍵寬 34pt，高度 42pt
  const finalWidth = minWidth ?? (wide ? 180 : 34);
  const finalHeight = height ?? 42;
  
  // 🔮 統一背景色：強制的玻璃霧化感，移除色差
  const finalBackground = background ?? "rgba(255, 255, 255, 0.85)";

  return <Button
    action={handleAction}
    buttonStyle="plain"
  >
    <ZStack 
      background={finalBackground} 
      // 🛡️ 物理鎖定：四周圓角標校
      clipShape={{ type: 'rect', cornerRadius: 10 }}
      frame={{ width: finalWidth, height: finalHeight }}
      shadow={{ color: 'rgba(0,0,0,0.1)', radius: 0.1, y: 1 }}
    >
      <VStack alignment="center">
        <Spacer />
        <Text 
          font={{ size: fontSize ?? 18, name: "system" }} 
          foregroundStyle={foregroundStyle}
        >
          {title}
        </Text>
        <Spacer />
      </VStack>
    </ZStack>
  </Button>
}
