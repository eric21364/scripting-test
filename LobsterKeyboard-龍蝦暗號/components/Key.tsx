import { Button } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.0.5 [範本同款 物理對位版]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle, minWidth, height, fontSize
  } = props;

  const handleAction = () => {
    if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
    action();
  }

  // 🧪 物理對位：完全對接範本規範
  // minWidth: 34 為標準键，寬度由 Button 組件自然撐開或強制設定
  const finalWidth = minWidth ?? (wide ? 80 : 34);
  const finalHeight = height ?? 44;

  return <Button
    title={title}
    action={handleAction}
    // 🛡️ 屬性對齊：按照範本配置，不使用多層 ZStack 防止寬度坍塌
    font={{ size: fontSize ?? 18, name: "system" }}
    fontWeight="medium"
    padding={{ vertical: 10 }}
    frame={{ minWidth: finalWidth, height: finalHeight }}
    background={background ?? "systemBackground"}
    foregroundStyle={foregroundStyle ?? "label"}
    clipShape={{
      type: 'rect',
      cornerRadius: 6
    }}
    shadow={{
      color: 'rgba(0,0,0,0.3)',
      radius: 0.5,
      y: 1,
    }}
  />
}
