import { Button, ZStack, VStack, Text, Spacer } from "scripting";

export function KeyView({
  title, subtitle, action, wide = false, background = "systemBackground", foregroundStyle = "label"
}: {
  title: string
  subtitle?: string
  action: () => void
  wide?: boolean
  background?: string
  foregroundStyle?: string
}) {
  return <Button
    action={action}
    buttonStyle="plain"
  >
    <ZStack 
      background={background} 
      cornerRadius={10} 
      frame={{ minWidth: wide ? 100 : 44, height: 54 }}
      shadow={{ color: 'rgba(0,0,0,0.1)', radius: 1, y: 1 }}
    >
      <VStack alignment="center">
        <Spacer />
        <Text font={{ size: 14, name: "system-bold" }} foregroundStyle={foregroundStyle}>{title}</Text>
        {subtitle && <Text font={{ size: 9 }} foregroundStyle="secondaryLabel">{subtitle}</Text>}
        <Spacer />
      </VStack>
    </ZStack>
  </Button>
}
