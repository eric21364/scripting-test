import { Button, ZStack, Text, VStack, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.2.2 [v2.0.4 物理美學重製版]
 * 採用雙層 ZStack 結構，確保按鈕範圍與觸碰手感
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", 
    minWidth, height, fontSize, functional = false, onTapGesture
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    if (action) action();
  }

  // 🧪 v2.0.4 物理標校：緊緻高度與寬大面積
  const finalWidth = minWidth ?? (wide ? 180 : 35); 
  const finalHeight = height ?? 38; 

  const DEFAULT_BG = functional ? "rgba(171, 177, 182, 1)" : "rgba(255, 255, 255, 1)";
  const keyBg = background ?? DEFAULT_BG;

  return <Button
    action={handleAction}
    onTapGesture={onTapGesture}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    {/* 底層：實體背框 (產生厚度) */}
    <ZStack 
      background="rgba(0,0,0,0.15)" 
      clipShape={{ type: 'rect', cornerRadius: 5 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      {/* 頂層：實體面鍵 (向上偏移營造重力感) */}
      <ZStack 
        background={keyBg} 
        clipShape={{ type: 'rect', cornerRadius: 5 }}
        frame={{ width: finalWidth, height: finalHeight - 1.5 }}
        offset={{ x: 0, y: -0.75 }}
      >
        <VStack alignment="center">
          <Spacer />
          <Text 
            font={{ size: fontSize ?? 17, name: "system" }} 
            fontWeight="bold"
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
