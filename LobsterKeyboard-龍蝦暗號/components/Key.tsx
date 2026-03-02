import { Button, Text, ZStack } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.1.9 [iOS 18 物理比例巔峰標校]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle, 
    minWidth, height, fontSize, onTapGesture, functional = false
  } = props;

  // 🧪 物理修正：iOS 原生按鍵比例為 32:42 (螢幕寬 375pt 下)
  const finalWidth = minWidth ?? (wide ? 180 : 32); 
  const finalHeight = height ?? 42; 

  // 原生配色對位
  const DEFAULT_BG = functional ? "rgba(172, 179, 188, 1)" : "rgba(255, 255, 255, 1)";
  const DEFAULT_TEXT = "label";

  return <Button
    action={() => {
      if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
      if (action) action();
    }}
    onTapGesture={onTapGesture}
    buttonStyle="plain"
    frame={{ width: finalWidth, height: finalHeight }}
  >
    {/* 🛡️ 實體邊界鎖定：這一步解決「背景不夠大」的問題 */}
    <ZStack 
      background={background ?? DEFAULT_BG}
      frame={{ width: finalWidth, height: finalHeight }}
      clipShape={{ type: 'rect', cornerRadius: 5 }} 
      shadow={{ color: 'rgba(0,0,0,0.35)', radius: 0, y: 1.2 }} 
    >
      <Text 
        font={{ size: fontSize ?? 19, name: "system" }}
        fontWeight="regular"
        foregroundStyle={foregroundStyle ?? DEFAULT_TEXT}
      >
        {title}
      </Text>
    </ZStack>
  </Button>
}
