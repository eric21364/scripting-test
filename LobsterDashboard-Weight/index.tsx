import { Navigation, Script, Dialog } from "scripting";
import { View } from "./pages";

(async () => {
    await Navigation.present({
        element: <View />,
        modalPresentationStyle: "fullScreen",
    });
})()
    .catch(async (e) => {
        await Dialog.alert({
            title: "龍蝦哨兵錯誤",
            message: String(e),
        });
    })
    .finally(async () => {
        Script.exit();
    });
