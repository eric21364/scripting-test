import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.7.3 物理對齊官版
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background = "systemBackground", foregroundStyle = "label", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 原生寬度標校：
  // 標準鍵寬 32pt，高度 42pt（最符合 iOS 手感）
  const finalWidth = minWidth ?? (wide ? 160 : 32);
  const finalHeight = height ?? 42;

  return <Button
    action={handleAction}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    <ZStack 
      background={background} 
      clipShape={{ type: 'rect', cornerRadius: 5 }} // 強制使用裁切實現圓角
      frame={{ width: finalWidth, height: finalHeight }}
      shadow={{ color: 'rgba(0,0,0,0.15)', radius: 0.5, y: 1 }}
    >
      <VStack alignment="center">
        <Spacer />
        <Text 
          font={{ size: fontSize ?? 16, name: "system" }} 
          foregroundStyle={foregroundStyle}
        >
          {title}
        </Text>
        <Spacer />
      </VStack>
    </ZStack>
  </Button>
}
