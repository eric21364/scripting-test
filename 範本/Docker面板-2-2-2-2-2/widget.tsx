import { Widget, Text, Notification } from "scripting";
import { sshExecuteCommand } from "./utils/ssh";
import { DockerInfoData, dockerInfoCmd } from "./widgets/type";

// import { View as accessoryRectangularView } from "./widgets/accessoryRectangular";
// import { View as accessoryCircularView } from "./widgets/accessoryCircular";
// import { View as accessoryInlineView } from "./widgets/accessoryInline";
import { View as SystemSmallView } from "./widgets/systemSmall";
import { View as SystemMediumView } from "./widgets/systemMedium";
import { View as SystemLargeView } from "./widgets/systemLarge";

(async () => {
  const status = await sshExecuteCommand(dockerInfoCmd);
  if (status === undefined) throw new Error();

  const data = JSON.parse(status) as DockerInfoData;

  // if (Widget.parameter) data.Name = Widget.parameter;

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
      throw new Error("Unsupported widget size");
  }
})().catch(async (e) => {
  await Notification.schedule({
    title: "错误",
    body: String(e),
  });
  Widget.present(<Text>{String(e)}</Text>);
});
