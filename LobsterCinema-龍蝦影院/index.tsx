import { Navigation, Script, Dialog } from "scripting";
import { View } from "./src/page";

(async () => {
    await Navigation.present({
        element: <View />,
        modalPresentationStyle: "fullScreen",
    });
})()
    .catch(async (e) => {
        console.error(e);
        await Dialog.alert({
            title: "龍蝦影院啟動失敗",
            message: String(e),
        });
    })
    .finally(async () => {
        Script.exit();
    });
