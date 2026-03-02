import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.9.5 [實體圓角與質感統一版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理標校：基礎鍵寬 36pt，高度 42pt
  const finalWidth = minWidth ?? (wide ? 180 : 36); 
  const finalHeight = height ?? 42; 
  
  // 🎨 色彩標校：預設白色背景 (字母鍵)，可由外部傳入灰色 (功能鍵)
  const finalBackground = background ?? "rgba(255, 255, 255, 1)";

  return <Button
    action={handleAction}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    <ZStack 
      background={finalBackground} 
      // 🛡️ 物理鎖定：全面強制圓角標校 (8pt)
      clipShape={{ type: 'rect', cornerRadius: 6 }}
      frame={{ width: finalWidth, height: finalHeight }}
      // 🧪 微投影營造立體感
      shadow={{ color: 'rgba(0,0,0,0.2)', radius: 0.5, y: 1.2 }}
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
