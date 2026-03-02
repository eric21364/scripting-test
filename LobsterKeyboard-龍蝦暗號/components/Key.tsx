import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.7.4 物理無框感標校
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background = "systemBackground", foregroundStyle = "label", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 理想物理標校：
  // 標準鍵寬 34pt，高度 42pt
  const finalWidth = minWidth ?? (wide ? 160 : 34);
  const finalHeight = height ?? 42;

  return <Button
    action={handleAction}
    buttonStyle="plain"
  >
    <ZStack 
      background={background} 
      // 🛡️ 物理防禦：移除所有可能導致「框線感」的屬性，改用乾淨的裁切
      clipShape={{ type: 'rect', cornerRadius: 5 }}
      frame={{ width: finalWidth, height: finalHeight }}
      // 🧪 陰影優化：微細陰影營造立體感，捨棄深色粗框線
      shadow={{ color: 'rgba(0,0,0,0.12)', radius: 0.2, y: 1 }}
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
