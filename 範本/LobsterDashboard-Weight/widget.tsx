import { Widget, Text, Notification } from "scripting";
import { LobsterStatusData, lobsterStatusUrl } from "./widgets/type";

import { View as SystemSmallView } from "./widgets/systemSmall";
import { View as SystemMediumView } from "./widgets/systemMedium";
import { View as SystemLargeView } from "./widgets/systemLarge";

(async () => {
    const response = await fetch(lobsterStatusUrl);
    if (!response.ok) throw new Error("無法取得龍蝦狀態");

    const data = (await response.json()) as LobsterStatusData;

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
