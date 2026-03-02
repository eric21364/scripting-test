import { Button, ZStack, Text, VStack, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.9.9 [實體飽滿背框 & 圓角對位版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理修正：
  // 標準鍵寬 38pt，高度 46pt (增加高度讓視覺上移)
  const finalWidth = minWidth ?? (wide ? 200 : 38); 
  const finalHeight = height ?? 46; 

  // 🎨 背景對位：預設白色 (字母)，功能鍵由外部傳入 gray
  const keyBg = background ?? "white";

  return <Button
    action={handleAction}
    buttonStyle="plain"
  >
    {/* 🛡️ 實體背框：使用雙層 ZStack 模擬 iOS 按鍵的「厚度感」與「陰影框線」 */}
    <ZStack 
      background="rgba(0,0,0,0.25)" // 層底深色框 (厚度感)
      clipShape={{ type: 'rect', cornerRadius: 8 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      <ZStack 
        background={keyBg} 
        clipShape={{ type: 'rect', cornerRadius: 7 }}
        frame={{ width: finalWidth, height: finalHeight - 1.5 }} // 位移 1.5pt 產生立體感
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
