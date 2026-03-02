import { Button, ZStack, Text, VStack, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.0.0 [物理圓角對位與 3D 厚度版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理修正：35pt 是 10 個按鍵在標準 iOS 寬度下的「不擠壓黃金上限」
  const finalWidth = minWidth ?? (wide ? 180 : 35); 
  const finalHeight = height ?? 44; 

  // 🎨 背景統一：預設採用 iOS 霧白玻璃感
  const keyBg = background ?? "rgba(255, 255, 255, 0.95)";

  return <Button
    action={handleAction}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    {/* 🛡️ 實體背框 (3D 厚度感) */}
    <ZStack 
      background="rgba(0,0,0,0.2)" 
      clipShape={{ type: 'rect', cornerRadius: 8 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      {/* 內層面鍵：位移 1.5pt 以露出底框，形成圓潤的厚度感 */}
      <ZStack 
        background={keyBg} 
        alignment="center"
        clipShape={{ type: 'rect', cornerRadius: 8 }}
        frame={{ width: finalWidth, height: finalHeight - 1.5 }}
        padding={{ bottom: 2 }} // 調整對齊確保圓角不因位移而奇怪
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
