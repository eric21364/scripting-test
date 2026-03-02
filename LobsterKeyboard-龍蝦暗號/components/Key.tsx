import { Button, ZStack, VStack, Text, Spacer } from "scripting";

declare const HapticFeedback: any;

export interface KeyViewProps {
  title: string;
  subtitle?: string;
  action: () => void;
  wide?: boolean;
  background?: any;
  foregroundStyle?: any;
  minWidth?: number;
  height?: number;
  fontSize?: number;
}

export function KeyView({
  title, subtitle, action, wide = false, background = "systemBackground", foregroundStyle = "label", minWidth, height = 44, fontSize = 20
}: KeyViewProps) {
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
      clipShape={{ type: 'rect', cornerRadius: 6 }}
      frame={{ minWidth: minWidth ?? (wide ? 160 : 32), height: height }}
      shadow={{ color: 'rgba(0,0,0,0.25)', radius: 0.2, y: 1.2 }}
    >
      <VStack alignment="center">
        <Spacer />
        <Text font={{ size: fontSize, name: "system" }} foregroundStyle={foregroundStyle}>{title}</Text>
        {subtitle ? (
          <Text font={{ size: 8, name: "system" }} foregroundStyle="secondaryLabel">{subtitle}</Text>
        ) : null}
        <Spacer />
      </VStack>
    </ZStack>
  </Button>
}
