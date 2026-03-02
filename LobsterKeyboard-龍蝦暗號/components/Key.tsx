import { Button, ZStack, VStack, Text, Spacer } from "scripting";

export function KeyView({
  title, subtitle, action, wide = false, background = "systemBackground", foregroundStyle = "label"
}: {
  title: string
  subtitle?: string
  action: () => void
  wide?: boolean
  background?: any
  foregroundStyle?: any
}) {
  return <Button
    action={action}
    buttonStyle="plain"
  >
    <ZStack 
      background={background} 
      frame={{ minWidth: wide ? 100 : 44, height: 54 }}
      shadow={{ color: 'rgba(0,0,0,0.1)', radius: 1, y: 1 }}
    >
      <VStack alignment="center">
        <Spacer />
        <Text font={{ size: 14, name: "system-bold" }} foregroundStyle={foregroundStyle}>{title}</Text>
        {subtitle ? (
          <Text font={{ size: 9, name: "system" }} foregroundStyle="secondaryLabel">{subtitle}</Text>
        ) : null}
        <Spacer />
      </VStack>
    </ZStack>
  </Button>
}
