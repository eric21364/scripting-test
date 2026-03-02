import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.7.2 物理擴張版
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background = "systemBackground", foregroundStyle = "label", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理對位：34pt 是英文鍵位不擠壓的最小臨界值
  // 增加橫向呼吸空間，防止「只有文字寬度」的視覺貧乏感
  const finalWidth = minWidth ?? (wide ? 160 : 34);
  const finalHeight = height ?? 40;

  return <Button
    action={handleAction}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    <ZStack 
      background={background} 
      clipShape={{ type: 'rect', cornerRadius: 6 }}
      frame={{ width: finalWidth, height: finalHeight }}
      shadow={{ color: 'rgba(0,0,0,0.2)', radius: 0.5, y: 1 }}
    >
      <VStack alignment="center">
        <Spacer />
        <Text 
          font={{ size: fontSize ?? 16, name: "system" }} 
          foregroundStyle={foregroundStyle}
          padding={{ horizontal: 4 }} // 物理補強：確保文字兩側有安全間隙
        >
          {title}
        </Text>
        <Spacer />
      </VStack>
    </ZStack>
  </Button>
}
