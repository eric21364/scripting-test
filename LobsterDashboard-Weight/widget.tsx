import { Widget, Text, Notification, VStack } from "scripting";
import { View as SystemSmallView } from "./widgets/systemSmall";
import { View as SystemMediumView } from "./widgets/systemMedium";
import { View as SystemLargeView } from "./widgets/systemLarge";

// 這裡未來可以接入主機的真實 API
async function fetchLobsterStatus() {
  try {
    // 預留對接 OpenClaw API 的邏輯
    // const res = await fetch("http://127.0.0.1:18789/status");
    // return await res.json();
    return {
      status: "ACTIVE",
      reputation: 71,
      threads: "Day 9",
      btc: "2,142,082",
      moltbook: "Suspended"
    };
  } catch (e) {
    return { status: "OFFLINE", reputation: 0, threads: "N/A" };
  }
}

(async () => {
  const data = await fetchLobsterStatus();

  switch (Widget.family) {
    case "systemSmall":
      Widget.present(<SystemSmallView data={data} />);
      break;
    case "systemMedium":
      Widget.present(<SystemMediumView data={data} />);
      break;
    case "systemLarge":
      Widget.present(<SystemLargeView data={data} />);
      break;
    default:
      Widget.present(<SystemMediumView data={data} />);
  }
})().catch(async (e) => {
  Widget.present(<Text>{String(e)}</Text>);
});
