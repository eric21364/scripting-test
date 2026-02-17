import { Navigation, Script } from "scripting";
import { View } from "./pages";
// import { closeSSH } from "./utils/ssh"

(async () => {
  await Navigation.present({
    element: <View />,
    modalPresentationStyle: "fullScreen",
  });
})()
  .catch(async (e) => {
    // console.error(e);
    await Dialog.alert({
      title: "错误",
      message: String(e),
    });
  })
  .finally(async () => {
    // await closeSSH();
    Script.exit();
  });
