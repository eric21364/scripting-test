import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

export function KeyView(props: any) {
  const {
    title, action, wide = false, background = "systemBackground", foregroundStyle = "label", minWidth, height = 44
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理診斷：如果是字母鍵，寬度必須足夠讓觸控點分開 (約 32-35pt)
  const finalWidth = minWidth ?? (wide ? 160 : 34);

  return <Button
    action={handleAction}
    buttonStyle="plain"
  >
    <ZStack 
      background={background} 
      cornerRadius={6}
      frame={{ width: finalWidth, height: height }}
    >
      <VStack alignment="center">
        <Spacer />
        <Text font={{ size: 18, name: "system" }} foregroundStyle={foregroundStyle}>{title}</Text>
        <Spacer />
      </VStack>
    </ZStack>
  </Button>
}
