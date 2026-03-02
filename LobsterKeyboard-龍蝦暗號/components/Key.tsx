import { Button, ZStack, Text, VStack, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.0.4 [物理比例校正與防擠壓版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理標校：精確鎖定寬度防止擠壓
  const finalWidth = minWidth ?? (wide ? 180 : 35); 
  const finalHeight = height ?? 40; // 降低按鍵高度，使整體更矮一點

  const keyBg = background ?? "white";

  return <Button
    action={handleAction}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    {/* 底層：實體背框 (深灰色產生厚度感) */}
    <ZStack 
      background="rgba(0,0,0,0.15)" 
      clipShape={{ type: 'rect', cornerRadius: 5 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      {/* 頂層：實體面鍵 (向上偏移 1.5pt) */}
      <ZStack 
        background={keyBg} 
        clipShape={{ type: 'rect', cornerRadius: 5 }}
        frame={{ width: finalWidth, height: finalHeight - 1.5 }}
        offset={{ x: 0, y: -0.75 }}
      >
        <VStack alignment="center">
          <Spacer />
          <Text 
            font={{ size: fontSize ?? 18, name: "system-bold" }} 
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
