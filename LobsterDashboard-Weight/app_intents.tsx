import { AppIntent, Parameter } from "scripting";

export const refreshStatus = new AppIntent({
  title: "刷新龍蝦狀態",
  description: "手動觸發龍蝦同步最新打工資訊",
  handler: async () => {
    // 這裡未來可以對接到 OpenClaw 的掃描指令
    return "狀態已同步！🦞";
  }
});
