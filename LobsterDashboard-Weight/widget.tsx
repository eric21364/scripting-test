import { Widget, Text, Notification } from "scripting";
import { sshExecuteCommand } from "./utils/ssh";
import { LobsterStatusData, lobsterStatusCmd } from "./widgets/type";

import { View as SystemSmallView } from "./widgets/systemSmall";
import { View as SystemMediumView } from "./widgets/systemMedium";
import { View as SystemLargeView } from "./widgets/systemLarge";

(async () => {
    const status = await sshExecuteCommand(lobsterStatusCmd);
    if (status === undefined) throw new Error();

    const data = JSON.parse(status) as LobsterStatusData;

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
        title: "龍蝦哨兵錯誤",
        body: String(e),
    });
    Widget.present(<Text>{String(e)}</Text>);
});
