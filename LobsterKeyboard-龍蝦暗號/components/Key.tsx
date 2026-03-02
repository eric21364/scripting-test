import { Button, ZStack, Text, VStack, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.0.2 [物理純淨化標校版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理修正：標準鍵寬 35pt，深度標校 42pt 高度
  const finalWidth = minWidth ?? (wide ? 180 : 35); 
  const finalHeight = height ?? 42; 

  const keyBg = background ?? "white";

  return <Button
    action={handleAction}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    <ZStack 
      background="rgba(0,0,0,0.12)" // 極細底色
      clipShape={{ type: 'rect', cornerRadius: 6 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      {/* 🛡️ 物理修復：移除 offset，改用固定高度差確保純淨度，消除周圍雜訊 */}
      <VStack spacing={0}>
        <ZStack 
          background={keyBg} 
          clipShape={{ type: 'rect', cornerRadius: 6 }}
          frame={{ width: finalWidth, height: finalHeight - 1.5 }}
        >
          <VStack alignment="center">
            <Spacer />
            <Text 
              font={{ size: fontSize ?? 18, name: "system-bold" }} 
              foregroundStyle={foregroundStyle}
              alignment="center"
            >
              {title}
            </Text>
            <Spacer />
          </VStack>
        </ZStack>
        <Spacer frame={{ height: 1.5 }} /> {/* 底部的 1.5pt 就是厚度感 */}
      </VStack>
    </ZStack>
  </Button>
}
