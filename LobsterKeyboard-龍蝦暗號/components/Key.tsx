import { Button, ZStack, Text, VStack, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.2.0 [物理 ZStack 質感複刻版]
 * 回歸 v2.0.4 的雙層 ZStack 設計，強化實體感與點擊範圍
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "label", 
    minWidth, height, fontSize, functional = false, onTapGesture
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    if (action) action();
  }

  // 🧪 物理修正：回歸 v2.0.4 的按鍵尺寸 (35x40) 以解決範圍過小的問題
  const finalWidth = minWidth ?? (wide ? 180 : 35); 
  const finalHeight = height ?? 42; 

  // iOS 原生功能配色標校
  const DEFAULT_BG = functional ? "rgba(172, 179, 188, 1)" : "rgba(255, 255, 255, 1)";
  const keyBg = background ?? DEFAULT_BG;

  return <Button
    action={handleAction}
    onTapGesture={onTapGesture}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    {/* 底層：實體背框 (模擬實體厚度與陰影) */}
    <ZStack 
      background="rgba(0,0,0,0.25)" 
      clipShape={{ type: 'rect', cornerRadius: 5 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      {/* 頂層：實體面鍵 (向上偏移 1.5pt，產生模擬厚度感) */}
      <ZStack 
        background={keyBg} 
        clipShape={{ type: 'rect', cornerRadius: 5 }}
        frame={{ width: finalWidth, height: finalHeight - 1.5 }}
        offset={{ x: 0, y: -0.8 }}
      >
        <VStack alignment="center">
          <Spacer />
          <Text 
            font={{ size: fontSize ?? 19, name: "system" }} 
            fontWeight="regular"
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
