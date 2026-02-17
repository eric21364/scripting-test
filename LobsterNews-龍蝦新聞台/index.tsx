import { Navigation, Script, Dialog } from "scripting";
import { NewsListPage } from "./src/pages";

(async () => {
    await Navigation.present({
        element: <NewsListPage />,
        modalPresentationStyle: "fullScreen",
    });
})()
    .catch(async (e) => {
        await Dialog.alert({
            title: "龍蝦新聞台錯誤",
            message: String(e),
        });
    })
    .finally(async () => {
        Script.exit();
    });
