import { AppIntentManager, AppIntentProtocol, Widget } from "scripting";

export const reloadWidget = AppIntentManager.register({
    name: "IntentWithoutParams",
    protocol: AppIntentProtocol.AppIntent,
    perform: async (params: undefined) => {
        Widget.reloadAll();
    },
});
