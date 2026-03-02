import { Button } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.1.0 [物理震動與多重手勢]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", 
    minWidth, height, fontSize, onTapGesture
  } = props;

  // 🧪 物理對位：標準寬度與高度適配 260pt 畫布
  const finalWidth = minWidth ?? (wide ? 180 : 34); 
  const finalHeight = height ?? 44; // 提升至 44pt 增加垂直觸控面積

  return <Button
    title={title}
    action={() => {
      // ⚡️ 物理反饋：每次點擊觸發輕微震動
      if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
      if (action) action();
    }}
    onTapGesture={onTapGesture}
    font={{ size: fontSize ?? 18, name: "system" }}
    fontWeight="medium"
    background={background ?? "systemSecondaryBackground"}
    foregroundStyle={foregroundStyle === "black" ? "label" : foregroundStyle}
    frame={{ width: finalWidth, height: finalHeight }}
    clipShape={{ type: 'rect', cornerRadius: 8 }}
    shadow={{ color: 'rgba(0,0,0,0.25)', radius: 1, y: 1.5 }} 
  />
}
