import { Widget, Text, Notification } from "scripting";
import { View as SystemSmallView } from "./widgets/systemSmall";
import { View as SystemMediumView } from "./widgets/systemMedium";
import { View as SystemLargeView } from "./widgets/systemLarge";

// 模擬龍蝦數據 (未來可從 OpenClaw API 獲取)
const getLobsterData = () => ({
  status: "ACTIVE",
  reputation: 71,
  threads: "Day 9",
  btc: "2,149,675",
  moltbook: "Suspended"
});

(async () => {
  const data = getLobsterData();

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
