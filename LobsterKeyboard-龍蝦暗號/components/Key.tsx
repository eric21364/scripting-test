import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.9.1 物理寬度校準版
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "label", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理診斷：如果是標準字母鍵 (10鍵一排)，物理極限寬度通常在 36-38pt 之間 (視螢幕寬度而定)
  // 將原本的 34pt 提升至 38pt，增加按鍵的實體飽滿度
  const finalWidth = minWidth ?? (wide ? 200 : 38); 
  const finalHeight = height ?? 44; // 提升高度至 44pt，更具歐美/專業鍵盤質感
  
  const finalBackground = background ?? "rgba(255, 255, 255, 0.9)";

  return <Button
    action={handleAction}
    buttonStyle="plain"
  >
    <ZStack 
      background={finalBackground} 
      clipShape={{ type: 'rect', cornerRadius: 8 }}
      frame={{ width: finalWidth, height: finalHeight }}
      shadow={{ color: 'rgba(0,0,0,0.1)', radius: 0.2, y: 1.5 }}
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
