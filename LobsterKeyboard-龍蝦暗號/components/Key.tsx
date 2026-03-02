import { Button, ZStack, Text, VStack, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.0.1 [物理飽滿校正版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理對位：35pt 是 10 個按鍵在標準橫屏不擠壓的上限
  const finalWidth = minWidth ?? (wide ? 180 : 35); 
  const finalHeight = height ?? 44; 

  // 🎨 背景統一：字母白鍵，功能鍵灰鍵
  const keyBg = background ?? "white";

  return <Button
    action={handleAction}
    buttonStyle="plain"
    // 🛡️ 實體高度鎖定：確保點擊區域
    frame={{ width: finalWidth, height: finalHeight }}
  >
    {/* 🛡️ 物理背框 (3D 厚度感) */}
    <ZStack 
      background="rgba(0,0,0,0.15)" 
      clipShape={{ type: 'rect', cornerRadius: 6 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      {/* 內層面鍵：位移 1.5pt 以露出底框，形成圓潤的厚度感 */}
      {/* 物理修正：移除 padding 改用 frame 嚴格鎖定寬度 */}
      <ZStack 
        background={keyBg} 
        alignment="center"
        clipShape={{ type: 'rect', cornerRadius: 6 }}
        frame={{ width: finalWidth, height: finalHeight - 2 }}
        offset={{ x: 0, y: -1 }} // 向上位移產生底部厚度
      >
        <VStack alignment="center" frame={{ width: finalWidth }}>
          <Spacer />
          <Text 
            font={{ size: fontSize ?? 18, name: "system-bold" }} 
            foregroundStyle={foregroundStyle}
            frame={{ maxWidth: "infinity" }}
            alignment="center"
          >
            {title}
          </Text>
          <Spacer />
        </VStack>
      </ZStack>
    </ZStack>
  </Button>
}
