import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.0.6 [強製寬度保險版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理對位：34pt 是確保 10 鍵在各機型不坍塌的「安全標校寬度」
  const finalWidth = minWidth ?? (wide ? 160 : 34); 
  const finalHeight = height ?? 44; 

  const keyBg = background ?? "white";

  return <Button
    action={handleAction}
    buttonStyle="plain"
    // 🛡️ 物理鎖定：在 Button 層級強制標註 frame，解決截圖中的細長條坍塌問題
    frame={{ width: finalWidth, height: finalHeight }}
  >
    <ZStack 
      background="rgba(0,0,0,0.15)" 
      clipShape={{ type: 'rect', cornerRadius: 6 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      <ZStack 
        background={keyBg} 
        clipShape={{ type: 'rect', cornerRadius: 6 }}
        frame={{ width: finalWidth, height: finalHeight - 2 }}
        offset={{ x: 0, y: -1 }}
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
