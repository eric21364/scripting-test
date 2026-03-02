import { Button } from "scripting";

declare const HapticFeedback: any;

/**
 * 龍蝦鍵盤通用按鍵 - v2.0.7 [範本對接與寬度鎖定]
 */
export function KeyView(props: any) {
  const {
    title, action, wide = false, background, foregroundStyle = "black", minWidth, height, fontSize
  } = props;

  // 🧪 物理標校：標準鍵寬 35pt，高度 42pt
  const finalWidth = minWidth ?? (wide ? 180 : 35); 
  const finalHeight = height ?? 42; 

  return <Button
    title={title}
    action={() => {
      if (typeof HapticFeedback !== 'undefined') HapticFeedback.lightImpact();
      action();
    }}
    // 🛡️ 實體渲染：完全對齊範本，使用 title 避免寬度坍塌
    font={{ size: fontSize ?? 18, name: "system" }}
    fontWeight="medium"
    background={background ?? "white"}
    foregroundStyle={foregroundStyle}
    frame={{ width: finalWidth, height: finalHeight }}
    clipShape={{ type: 'rect', cornerRadius: 6 }}
    // 🧪 物理外框感：利用 shadow y=1.5 模擬底框
    shadow={{ color: 'rgba(0,0,0,0.15)', radius: 0, y: 1.5 }} 
  />
}
