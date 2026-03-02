import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.9.6 [實體霸氣寬度與物理圓角版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理標校：40pt 飽滿寬度，45pt 高度 (增加點擊面積)
  const finalWidth = minWidth ?? (wide ? 180 : 38); 
  const finalHeight = height ?? 45; 
  
  // 🎨 質感標校：恢復「物理外框」效果
  const keyBaseColor = background ?? "rgba(255, 255, 255, 1)";
  const borderColor = "rgba(0, 0, 0, 0.15)";

  return <Button
    action={handleAction}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    <ZStack 
      background={borderColor} 
      clipShape={{ type: 'rect', cornerRadius: 8 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      <ZStack 
        background={keyBaseColor} 
        clipShape={{ type: 'rect', cornerRadius: 7 }}
        frame={{ width: finalWidth, height: finalHeight - 1.5 }} // 底留 1.5pt 作為物理厚度感
      >
        <VStack alignment="center">
          <Spacer />
          <Text 
            font={{ size: fontSize ?? 18, name: "system-bold" }} // 加粗提升辨識度
            foregroundStyle={foregroundStyle}
          >
            {title}
          </Text>
          <Spacer />
        </VStack>
      </ZStack>
    </ZStack>
  </Button>
}
