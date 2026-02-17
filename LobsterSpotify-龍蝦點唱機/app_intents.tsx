import { AppIntentManager, AppIntentProtocol, Widget } from "scripting";
import {
    loadConfig,
    isConfigReady,
    playResume,
    pause,
    skipToNext,
    skipToPrevious,
} from "./src/spotify";

export const reloadSpotify = AppIntentManager.register({
    name: "IntentWithoutParams",
    protocol: AppIntentProtocol.AppIntent,
    perform: async (params: undefined) => {
        Widget.reloadAll();
    },
});

export const spotifyControl = AppIntentManager.register({
    name: "SpotifyControlIntent",
    protocol: AppIntentProtocol.AppIntent,
    perform: async (params: { action: string }) => {
        const config = loadConfig();
        if (!isConfigReady(config)) return;

        try {
            switch (params.action) {
                case "play":
                    await playResume(config);
                    break;
                case "pause":
                    await pause(config);
                    break;
                case "next":
                    await skipToNext(config);
                    break;
                case "prev":
                    await skipToPrevious(config);
                    break;
            }
        } catch (e) {
            // silently fail
        }

        Widget.reloadAll();
    },
});
