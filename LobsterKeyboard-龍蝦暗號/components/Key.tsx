import { Button, ZStack, Text, VStack, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.9.8 [強制圓角與物理寬度標校版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background = "white", foregroundStyle = "black", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理修正：
  // 10鍵排佈下，35pt 是安全寬度，38-40pt 是盈滿寬度
  // 這裡鎖定 38pt 寬度，45pt 高度，確保壯碩的手感
  const finalWidth = minWidth ?? (wide ? 200 : 38); 
  const finalHeight = height ?? 45; 

  return <Button
    action={handleAction}
    buttonStyle="plain"
  >
    {/* 🛡️ 實體圓角解決方案：不依賴 Button 本身的 cornerRadius，
        而是將圓角強制鎖定在具備背景色的 ZStack 上並進行裁切 */}
    <ZStack 
      background={background} 
      clipShape={{ type: 'rect', cornerRadius: 8 }}
      frame={{ width: finalWidth, height: finalHeight }}
      shadow={{ color: 'rgba(0,0,0,0.15)', radius: 0.5, y: 1 }}
    >
      <VStack alignment="center">
        <Spacer />
        <Text 
          font={{ size: fontSize ?? 20, name: "system-bold" }} 
          foregroundStyle={foregroundStyle}
        >
          {title}
        </Text>
        <Spacer />
      </VStack>
    </ZStack>
  </Button>
}
