import { Navigation, Script, Dialog } from "scripting";
import { PlayerPage } from "./src/pages";

(async () => {
    await Navigation.present({
        element: <PlayerPage />,
        modalPresentationStyle: "fullScreen",
    });
})()
    .catch(async (e) => {
        await Dialog.alert({
            title: "龍蝦點唱機錯誤",
            message: String(e),
        });
    })
    .finally(async () => {
        Script.exit();
    });
