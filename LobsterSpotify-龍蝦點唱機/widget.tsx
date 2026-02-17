import {
    Widget,
    Text,
    VStack,
    HStack,
    Image,
    Spacer,
    Divider,
    Color,
    Button,
    Notification,
} from "scripting";
import { loadConfig, isConfigReady, getCurrentlyPlaying, formatDuration } from "./src/spotify";
import { SpotifyTrack } from "./src/types";
import { reloadSpotify, spotifyControl } from "./app_intents";

function ControlButtons() {
    return (
        <HStack spacing={16}>
            <Spacer />
            <Button buttonStyle={"plain"} intent={spotifyControl({ action: "prev" })}>
                <Image
                    systemName="backward.fill"
                    foregroundStyle={"label"}
                    font={14}
                />
            </Button>
            <Button buttonStyle={"plain"} intent={spotifyControl({ action: "playpause" })}>
                <Image
                    systemName="playpause.fill"
                    foregroundStyle={"systemGreen"}
                    font={18}
                />
            </Button>
            <Button buttonStyle={"plain"} intent={spotifyControl({ action: "next" })}>
                <Image
                    systemName="forward.fill"
                    foregroundStyle={"label"}
                    font={14}
                />
            </Button>
            <Spacer />
        </HStack>
    );
}

function SmallView({ track }: { track: SpotifyTrack | null }) {
    return (
        <VStack padding spacing={4}>
            <HStack>
                <Image systemName="music.note" foregroundStyle={"systemGreen"} />
                <Text bold font={12}>🦞 點唱機</Text>
                <Spacer />
                <Button buttonStyle={"plain"} intent={reloadSpotify(undefined)}>
                    <Image systemName={"arrow.clockwise"} foregroundStyle={"accentColor"} font={12} />
                </Button>
            </HStack>
            <Spacer />
            {track ? (
                <>
                    <Text bold lineLimit={2} font={14}>{track.name}</Text>
                    <Text font={11} foregroundStyle="secondaryLabel" lineLimit={1}>
                        {track.artist}
                    </Text>
                    <Spacer />
                    <ControlButtons />
                </>
            ) : (
                <Text foregroundStyle="secondaryLabel" font={13}>沒有在播放</Text>
            )}
        </VStack>
    );
}

function MediumView({ track }: { track: SpotifyTrack | null }) {
    return (
        <VStack padding spacing={6}>
            <HStack>
                <Image systemName="music.note" foregroundStyle={"systemGreen"} />
                <Text bold font={13}>🦞 龍蝦點唱機</Text>
                <Spacer />
                <Button buttonStyle={"plain"} intent={reloadSpotify(undefined)}>
                    <Image systemName={"arrow.clockwise"} foregroundStyle={"accentColor"} />
                </Button>
                <Image
                    systemName={track?.isPlaying ? "speaker.wave.2.fill" : "speaker.slash"}
                    foregroundStyle={track?.isPlaying ? "systemGreen" : "systemGray"}
                    font={12}
                />
            </HStack>
            <Divider />
            {track ? (
                <>
                    <HStack spacing={12}>
                        <VStack alignment="leading" spacing={4}>
                            <Text bold lineLimit={1} font={15}>{track.name}</Text>
                            <Text font={12} foregroundStyle="secondaryLabel" lineLimit={1}>
                                {track.artist}
                            </Text>
                            <Text font={11} foregroundStyle="tertiaryLabel" lineLimit={1}>
                                {track.album}
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack>
                        <Text font={11} foregroundStyle="secondaryLabel">
                            {formatDuration(track.progressMs)} / {formatDuration(track.durationMs)}
                        </Text>
                        <Spacer />
                        <ControlButtons />
                    </HStack>
                </>
            ) : (
                <VStack>
                    <Text foregroundStyle="secondaryLabel">目前沒有在播放音樂</Text>
                    <Text font={12} foregroundStyle="tertiaryLabel">點擊刷新檢查 🎵</Text>
                </VStack>
            )}
        </VStack>
    );
}

function LargeView({ track }: { track: SpotifyTrack | null }) {
    return (
        <VStack padding spacing={8}>
            <HStack>
                <Image systemName="music.note" foregroundStyle={"systemGreen"} font={20} />
                <Text bold font={16}>🦞 龍蝦點唱機</Text>
                <Spacer />
                <Button buttonStyle={"plain"} intent={reloadSpotify(undefined)}>
                    <Image systemName={"arrow.clockwise"} foregroundStyle={"accentColor"} />
                </Button>
            </HStack>
            <Divider />
            {track ? (
                <>
                    <VStack alignment="leading" spacing={6}>
                        <Text bold font={20} lineLimit={2}>{track.name}</Text>
                        <Text font={15} foregroundStyle="secondaryLabel" lineLimit={1}>
                            {track.artist}
                        </Text>
                        <Text font={13} foregroundStyle="tertiaryLabel" lineLimit={1}>
                            {track.album}
                        </Text>
                    </VStack>
                    <Spacer />
                    <HStack>
                        <Image
                            systemName={track.isPlaying ? "speaker.wave.2.fill" : "speaker.slash"}
                            foregroundStyle={track.isPlaying ? "systemGreen" : "systemOrange"}
                            font={12}
                        />
                        <Text font={13} foregroundStyle="secondaryLabel">
                            {formatDuration(track.progressMs)} / {formatDuration(track.durationMs)}
                        </Text>
                    </HStack>
                    <ControlButtons />
                </>
            ) : (
                <>
                    <Spacer />
                    <VStack alignment="center" spacing={8}>
                        <Image
                            systemName="music.note.house"
                            foregroundStyle={"systemGray"}
                            font={40}
                        />
                        <Text foregroundStyle="secondaryLabel" font={15}>
                            目前沒有在播放音樂
                        </Text>
                    </VStack>
                    <Spacer />
                </>
            )}
        </VStack>
    );
}

(async () => {
    const config = loadConfig();
    let track: SpotifyTrack | null = null;

    if (isConfigReady(config)) {
        try {
            track = await getCurrentlyPlaying(config);
        } catch (e) {
            // silently fail, show "not playing"
        }
    }

    switch (Widget.family) {
        case "systemSmall":
            Widget.present(<SmallView track={track} />);
            break;
        case "systemMedium":
            Widget.present(<MediumView track={track} />);
            break;
        case "systemLarge":
            Widget.present(<LargeView track={track} />);
            break;
        default:
            Widget.present(<MediumView track={track} />);
    }
})().catch(async (e) => {
    await Notification.schedule({
        title: "龍蝦點唱機錯誤",
        body: String(e),
    });
    Widget.present(<Text>{String(e)}</Text>);
});
