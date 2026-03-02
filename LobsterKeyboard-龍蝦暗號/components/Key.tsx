import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵組件
 */
export function KeyView(props: any) {
  const {
    title, subtitle, action, wide = false, background = "systemBackground", foregroundStyle = "label", minWidth, height = 44, fontSize = 20
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  return <Button
    action={handleAction}
    buttonStyle="plain"
  >
    <ZStack 
      background={background} 
      frame={{ minWidth: minWidth ?? (wide ? 160 : 32), height: height }}
      shadow={{ color: 'rgba(0,0,0,0.25)', radius: 0.2, y: 1.2 }}
    >
      <VStack alignment="center">
        <Spacer />
        <Text font={{ size: fontSize, name: "system-bold" }} foregroundStyle={foregroundStyle}>{title}</Text>
        {subtitle ? (
          <Text font={{ size: 8, name: "system" }} foregroundStyle="secondaryLabel">{subtitle}</Text>
        ) : null}
        <Spacer />
      </VStack>
    </ZStack>
  </Button>
}
