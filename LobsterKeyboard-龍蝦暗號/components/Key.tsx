import { Button, ZStack, Text, VStack, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.0.3 [TypeScript 嚴格修復版]
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
      background="rgba(0,0,0,0.12)" 
      clipShape={{ type: 'rect', cornerRadius: 6 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      <VStack spacing={0}>
        <ZStack 
          background={keyBg} 
          clipShape={{ type: 'rect', cornerRadius: 6 }}
          frame={{ width: finalWidth, height: finalHeight - 1.5 }}
        >
          <VStack alignment="center">
            <Spacer />
            {/* 🛡️ 修正點 1：移除 Text 組件上不存在的 alignment 屬性 */}
            <Text 
              font={{ size: fontSize ?? 18, name: "system-bold" }} 
              foregroundStyle={foregroundStyle}
            >
              {title}
            </Text>
            <Spacer />
          </VStack>
        </ZStack>
        {/* 🛡️ 修正點 2：移除 VStack 內部的裸漏 Spacer 與雜項，確保 children 類型正確 */}
        <VStack frame={{ height: 1.5 }} />
      </VStack>
    </ZStack>
  </Button>
}
