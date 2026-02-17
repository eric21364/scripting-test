import {
    NavigationStack,
    Image,
    Text,
    List,
    Section,
    HStack,
    VStack,
    Navigation,
    Spacer,
    Button,
    useState,
    useEffect,
    ProgressView,
} from "scripting";
import { SpotifyConfig, SpotifyTrack, SpotifyRecentTrack } from "./types";
import {
    loadConfig,
    isConfigReady,
    getCurrentlyPlaying,
    getRecentlyPlayed,
    formatDuration,
} from "./spotify";
import { SettingsPage } from "./settings";

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return "剛剛";
    if (diffMin < 60) return `${diffMin} 分鐘前`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} 小時前`;
    return `${Math.floor(diffHr / 24)} 天前`;
}

export function PlayerPage() {
    const dismiss = Navigation.useDismiss();

    const [config, setConfig] = useState<SpotifyConfig>(loadConfig());
    const [current, setCurrent] = useState<SpotifyTrack | null>(null);
    const [recent, setRecent] = useState<SpotifyRecentTrack[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchAll = async () => {
        const cfg = loadConfig();
        setConfig(cfg);
        if (!isConfigReady(cfg)) {
            setIsLoading(false);
            return;
        }
        try {
            const [track, history] = await Promise.all([
                getCurrentlyPlaying(cfg),
                getRecentlyPlayed(cfg, 10),
            ]);
            setCurrent(track);
            setRecent(history);
        } catch (e) {
            // silently fail
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        async function init() {
            const cfg = loadConfig();
            if (!isConfigReady(cfg)) {
                await Navigation.present(<SettingsPage />);
            }
            await fetchAll();
        }
        init();
    }, []);

    return (
        <NavigationStack>
            <VStack
                navigationTitle={"🦞 龍蝦點唱機"}
                toolbar={{
                    topBarLeading: [
                        <Button action={() => dismiss()}>
                            <Image systemName="xmark" />
                        </Button>,
                        <Button
                            action={async () => {
                                await Navigation.present(<SettingsPage />);
                                await fetchAll();
                            }}>
                            <Image systemName="gear" />
                        </Button>,
                    ],
                    topBarTrailing: [
                        <Button
                            action={async () => {
                                setIsLoading(true);
                                await fetchAll();
                            }}>
                            <Image systemName="arrow.clockwise" />
                        </Button>,
                    ],
                }}>
                {(() => {
                    if (isLoading)
                        return (
                            <>
                                <ProgressView progressViewStyle={"circular"} padding />
                                <Spacer />
                            </>
                        );

                    return (
                        <List
                            refreshable={async () => {
                                await fetchAll();
                            }}>
                            <Section title="正在播放">
                                {current ? (
                                    <>
                                        <HStack>
                                            <Image
                                                systemName={
                                                    current.isPlaying
                                                        ? "play.circle.fill"
                                                        : "pause.circle.fill"
                                                }
                                                foregroundStyle={
                                                    current.isPlaying
                                                        ? "systemGreen"
                                                        : "systemOrange"
                                                }
                                                font={24}
                                                frame={{ width: 32 }}
                                            />
                                            <VStack alignment="leading" spacing={2}>
                                                <Text bold lineLimit={1}>
                                                    {current.name}
                                                </Text>
                                                <Text
                                                    font={13}
                                                    foregroundStyle="secondaryLabel"
                                                    lineLimit={1}>
                                                    {current.artist}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                        <HStack>
                                            <Image
                                                systemName="opticaldisc"
                                                foregroundStyle={"systemPurple"}
                                                frame={{ width: 24 }}
                                            />
                                            <Text>{current.album}</Text>
                                        </HStack>
                                        <HStack>
                                            <Image
                                                systemName="timer"
                                                foregroundStyle={"systemBlue"}
                                                frame={{ width: 24 }}
                                            />
                                            <Text>
                                                {formatDuration(current.progressMs)} /{" "}
                                                {formatDuration(current.durationMs)}
                                            </Text>
                                        </HStack>
                                    </>
                                ) : (
                                    <Text foregroundStyle="secondaryLabel">
                                        目前沒有在播放音樂 🎵
                                    </Text>
                                )}
                            </Section>
                            <Section title={`最近播放（${recent.length}）`}>
                                {recent.length === 0 ? (
                                    <Text foregroundStyle="secondaryLabel">
                                        沒有播放紀錄
                                    </Text>
                                ) : (
                                    recent.map((track, i) => (
                                        <HStack
                                            key={`recent-${i}`}
                                            alignment="center"
                                            spacing={8}>
                                            <VStack
                                                alignment="leading"
                                                spacing={2}
                                                frame={{
                                                    maxWidth: "infinity",
                                                    alignment: "leading",
                                                }}>
                                                <Text lineLimit={1}>{track.name}</Text>
                                                <Text
                                                    lineLimit={1}
                                                    font="caption"
                                                    foregroundStyle="secondaryLabel">
                                                    {track.artist} · {track.album}
                                                </Text>
                                            </VStack>
                                            <Text
                                                font={11}
                                                foregroundStyle="tertiaryLabel">
                                                {formatTimeAgo(track.playedAt)}
                                            </Text>
                                        </HStack>
                                    ))
                                )}
                            </Section>
                        </List>
                    );
                })()}
            </VStack>
        </NavigationStack>
    );
}
