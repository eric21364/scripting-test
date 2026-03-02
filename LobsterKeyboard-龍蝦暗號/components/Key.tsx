import { Button, ZStack, Text, VStack, Spacer } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.2.6 [物理美學與連續刪除支援]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", 
    minWidth, height, fontSize, functional = false, onTapGesture, onLongPressGesture
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    if (action) action();
  }

  const finalWidth = minWidth ?? (wide ? 180 : 35); 
  const finalHeight = height ?? 40; 

  const DEFAULT_BG = functional ? "rgba(171, 177, 182, 1)" : "rgba(255, 255, 255, 1)";
  const keyBg = background ?? DEFAULT_BG;

  return <Button
    action={handleAction}
    onTapGesture={onTapGesture}
    onLongPressGesture={onLongPressGesture}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    <ZStack 
      background="rgba(0,0,0,0.15)" 
      clipShape={{ type: 'rect', cornerRadius: 5 }}
      frame={{ width: finalWidth, height: finalHeight }}
    >
      <ZStack 
        background={keyBg} 
        clipShape={{ type: 'rect', cornerRadius: 5 }}
        frame={{ width: finalWidth, height: finalHeight - 1.5 }}
        offset={{ x: 0, y: -0.75 }}
      >
        <VStack alignment="center">
          <Spacer />
          <Text 
            font={{ size: fontSize ?? 17, name: "system" }} 
            fontWeight="bold"
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
