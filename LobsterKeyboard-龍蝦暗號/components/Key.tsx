import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

export function KeyView(props: any) {
  const {
    title, action, wide = false, background = "systemBackground", foregroundStyle = "label", minWidth, height = 44, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理診斷：緊湊型寬度設定 (31pt)，確保不被擠壓
  const finalWidth = minWidth ?? (wide ? 160 : 31);
  const finalHeight = height ?? 38;

  return <Button
    action={handleAction}
    buttonStyle="plain"
  >
    <ZStack 
      background={background} 
      clipShape={{ type: 'rect', cornerRadius: 5 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      <VStack alignment="center">
        <Spacer />
        <Text font={{ size: fontSize ?? 14, name: "system" }} foregroundStyle={foregroundStyle}>{title}</Text>
        <Spacer />
      </VStack>
    </ZStack>
  </Button>
}
