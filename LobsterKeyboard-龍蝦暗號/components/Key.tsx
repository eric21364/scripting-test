import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.9.4 [實體框線與圓角補強版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理對位：
  // 標準鍵寬 36pt (對應 390pt 屏幕)，高度 42pt
  // 36 * 10 + 2 * 9 = 378 (留兩側 6pt 安全區)
  const finalWidth = minWidth ?? (wide ? 180 : 36); 
  const finalHeight = height ?? 42; 
  
  const finalBackground = background ?? "rgba(255, 255, 255, 0.95)";

  return <Button
    action={handleAction}
    buttonStyle="plain"
  >
    <ZStack 
      background={finalBackground} 
      // 🛡️ 實體圓角與框線：改用具備實體屬性的裁切方案
      clipShape={{ type: 'rect', cornerRadius: 8 }}
      frame={{ width: finalWidth, height: finalHeight }}
      // 🧪 物理框線：利用 Shadow 模擬精細的 0.5pt 灰框
      shadow={{ color: 'rgba(0,0,0,0.2)', radius: 0.5, y: 1 }}
    >
      {/* 🔮 物理外框：多層 ZStack 背景模擬 */}
      <VStack 
          frame={{ width: finalWidth, height: finalHeight }} 
          background="rgba(0,0,0,0.05)" // 極輕框線底色
          clipShape={{ type: 'rect', cornerRadius: 8 }}
      >
        <ZStack 
            background={finalBackground} 
            cornerRadius={8} 
            frame={{ width: finalWidth - 1, height: finalHeight - 1 }}
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
      </VStack>
    </ZStack>
  </Button>
}
