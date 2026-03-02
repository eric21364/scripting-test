import { Button, ZStack, VStack, Text, Spacer } from "scripting";

// ⚠️ 全域 HapticFeedback 宣告
declare const HapticFeedback: any;

export function KeyView({
  title, subtitle, action, wide = false, background = "systemBackground", foregroundStyle = "label", minWidth, height = 44
}: {
  title: string
  subtitle?: string
  action: () => void
  wide?: boolean
  background?: any
  foregroundStyle?: any
  minWidth?: number
  height?: number
}) {
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
      clipShape={{ type: 'rect', cornerRadius: 5 }}
      frame={{ minWidth: minWidth ?? (wide ? 80 : 32), height: height }}
      shadow={{ color: 'rgba(0,0,0,0.15)', radius: 0.5, y: 1 }}
    >
      <VStack alignment="center">
        <Spacer />
        <Text font={{ size: 16, name: "system-bold" }} foregroundStyle={foregroundStyle}>{title}</Text>
        {subtitle ? (
          <Text font={{ size: 8, name: "system" }} foregroundStyle="secondaryLabel">{subtitle}</Text>
        ) : null}
        <Spacer />
      </VStack>
    </ZStack>
  </Button>
}
