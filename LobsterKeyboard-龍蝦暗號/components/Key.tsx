import { Button, ZStack, Text, VStack, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.2.1 [v2.0.4 物理美學複刻版]
 * 回歸雙層 ZStack 結構，解決「按鈕範圍過小」與「質感欠缺」問題
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

  // 🧪 物理標校：回歸 v2.0.4 的標準比例 (35x40)
  const finalWidth = minWidth ?? (wide ? 180 : 35); 
  const finalHeight = height ?? 40; 

  // v2.0.4 經典配色
  const DEFAULT_BG = functional ? "rgba(171, 177, 182, 1)" : "rgba(255, 255, 255, 1)";
  const keyBg = background ?? DEFAULT_BG;

  return <Button
    action={handleAction}
    onTapGesture={onTapGesture}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    {/* 底層：實體深色背框 (產生物理厚度陰影) */}
    <ZStack 
      background="rgba(0,0,0,0.2)" 
      clipShape={{ type: 'rect', cornerRadius: 5 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      {/* 頂層：實體白色面鍵 (向上偏移 1.5pt 營造厚度感) */}
      <ZStack 
        background={keyBg} 
        clipShape={{ type: 'rect', cornerRadius: 5 }}
        frame={{ width: finalWidth, height: finalHeight - 1.5 }}
        offset={{ x: 0, y: -0.75 }}
      >
        <VStack alignment="center" frame={{maxWidth:"infinity", maxHeight:"infinity"}}>
          <Spacer />
          <Text 
            font={{ size: fontSize ?? 18, name: "system" }} 
            fontWeight="bold"
            foregroundStyle={foregroundStyle === "label" ? "black" : foregroundStyle}
          >
            {title}
          </Text>
          <Spacer />
        </VStack>
      </ZStack>
    </ZStack>
  </Button>
}
