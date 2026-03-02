import { Button } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v1.9.7 [範本標校對位版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle, minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理對位：36pt 是 iOS 標準螢幕下字母鍵的飽滿寬度
  const finalWidth = minWidth ?? (wide ? 180 : 36);
  const finalHeight = height ?? 42;

  return <Button
    title={title}
    action={handleAction}
    font={{ size: fontSize ?? 18, name: "system" }} // 標校字體屬性
    fontWeight="medium"
    background={background ?? "systemBackground"} // 預設白底 (systemBackground)
    foregroundStyle={foregroundStyle ?? "label"}
    padding={{ vertical: 10 }}
    frame={{ width: finalWidth, height: finalHeight }}
    clipShape={{
      type: 'rect',
      cornerRadius: 6
    }}
    shadow={{
      color: 'rgba(0,0,0,0.15)',
      radius: 1,
      y: 1,
    }}
  />
}
