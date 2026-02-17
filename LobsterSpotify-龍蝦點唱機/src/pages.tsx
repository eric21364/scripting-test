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
    Slider,
    useRef,
    useState,
    useEffect,
    ProgressView,
} from "scripting";
import { SpotifyConfig, SpotifyTrack, SpotifyRecentTrack, SpotifyDevice } from "./types";
import {
    loadConfig,
    isConfigReady,
    getCurrentlyPlaying,
    getRecentlyPlayed,
    playResume,
    pause,
    skipToNext,
    skipToPrevious,
    getDevices,
    transferPlayback,
    setVolume,
    formatDuration,
    deviceIcon,
} from "./spotify";
import { SettingsPage } from "./settings";

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return "剛剛";
    if (diffMin < 60) return diffMin + " 分鐘前";
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return diffHr + " 小時前";
    return Math.floor(diffHr / 24) + " 天前";
}

// ─── 裝置頁面 ───

function DevicesPage(): JSX.Element {
    const dismiss = Navigation.useDismiss();
    const [devices, setDevices] = useState<SpotifyDevice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [statusMsg, setStatusMsg] = useState<string>("");

    const config = loadConfig();

    function fetchDevices(): void {
        setLoading(true);
        getDevices(config).then((list) => {
            setDevices(list);
            setStatusMsg("");
            setLoading(false);
        }).catch((e) => {
            setStatusMsg("❌ " + String(e));
            setLoading(false);
        });
    }

    function switchTo(deviceId: string, deviceName: string): void {
        setStatusMsg("🔄 切換至 " + deviceName + "...");
        transferPlayback(config, deviceId).then((result) => {
            if (result === "ok") {
                setStatusMsg("✅ 已切換至 " + deviceName);
                fetchDevices();
            } else {
                setStatusMsg("⚠️ " + result);
            }
        }).catch((e) => {
            setStatusMsg("❌ 切換失敗: " + String(e));
        });
    }

    useEffect(() => {
        fetchDevices();
    }, []);

    return (
        <NavigationStack>
            <List
                navigationTitle={"在線裝置"}
                navigationBarTitleDisplayMode={"inline"}
                toolbar={{
                    topBarLeading: [
                        <Button action={() => dismiss()}>
                            <Text>關閉</Text>
                        </Button>,
                    ],
                    topBarTrailing: [
                        <Button action={() => fetchDevices()}>
                            <Image systemName="arrow.clockwise" />
                        </Button>,
                    ],
                }}>
                {loading ? (
                    <Section>
                        <ProgressView progressViewStyle={"circular"} />
                    </Section>
                ) : devices.length === 0 ? (
                    <Section>
                        <HStack>
                            <Image systemName="wifi.slash" foregroundStyle={"systemGray"} frame={{ width: 24 }} />
                            <Text foregroundStyle="secondaryLabel">沒有在線裝置，請先開啟 Spotify App</Text>
                        </HStack>
                    </Section>
                ) : (
                    <Section title={"共 " + devices.length + " 個裝置"}>
                        {devices.map((device, i) => (
                            <Button
                                key={"dev-" + i}
                                action={() => {
                                    if (!device.isActive) {
                                        switchTo(device.id, device.name);
                                    }
                                }}>
                                <HStack spacing={10}>
                                    <Image
                                        systemName={deviceIcon(device.type)}
                                        foregroundStyle={device.isActive ? "systemGreen" : "secondaryLabel"}
                                        font={20}
                                        frame={{ width: 28 }}
                                    />
                                    <VStack alignment="leading" spacing={2}>
                                        <Text bold={device.isActive}>{device.name}</Text>
                                        <Text font={12} foregroundStyle="secondaryLabel">
                                            {device.type}{device.isActive ? " · 使用中" : ""}
                                            {device.volumePercent !== null ? " · 🔊 " + device.volumePercent + "%" : ""}
                                        </Text>
                                    </VStack>
                                    <Spacer />
                                    {device.isActive ? (
                                        <Image systemName="checkmark.circle.fill" foregroundStyle={"systemGreen"} />
                                    ) : (
                                        <Image systemName="arrow.right.circle" foregroundStyle={"tertiaryLabel"} />
                                    )}
                                </HStack>
                            </Button>
                        ))}
                    </Section>
                )}
                {statusMsg.length > 0 ? (
                    <Section>
                        <Text font={13}>{statusMsg}</Text>
                    </Section>
                ) : null}
            </List>
        </NavigationStack>
    );
}

// ─── 主頁面 ───

export function PlayerPage() {
    const dismiss = Navigation.useDismiss();

    const [current, setCurrent] = useState<SpotifyTrack | null>(null);
    const [recent, setRecent] = useState<SpotifyRecentTrack[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [configReady, setConfigReady] = useState<boolean>(isConfigReady(loadConfig()));
    const [controlMsg, setControlMsg] = useState<string>("");
    const [volume, setVolumeVal] = useState<number>(50);
    const volumeRef = useRef<number>(50);

    function fetchAll(): void {
        const cfg = loadConfig();
        if (!isConfigReady(cfg)) {
            setConfigReady(false);
            return;
        }
        setConfigReady(true);
        setIsLoading(true);
        Promise.all([
            getCurrentlyPlaying(cfg),
            getRecentlyPlayed(cfg, 10),
            getDevices(cfg),
        ]).then(([track, history, devices]) => {
            setCurrent(track);
            setRecent(history);
            const active = devices.find((d) => d.isActive);
            if (active && active.volumePercent !== null) {
                setVolumeVal(active.volumePercent);
                volumeRef.current = active.volumePercent;
            }
            setIsLoading(false);
        }).catch(() => {
            setIsLoading(false);
        });
    }

    function openSettings(): void {
        Navigation.present(<SettingsPage />).then(() => fetchAll());
    }

    function openDevices(): void {
        Navigation.present(<DevicesPage />).then(() => fetchAll());
    }

    function doPlay(): void {
        const cfg = loadConfig();
        playResume(cfg).then((result) => {
            if (result === "ok") {
                setControlMsg("");
                fetchAll();
            } else {
                setControlMsg("⚠️ " + result);
            }
        }).catch((e) => setControlMsg("❌ " + String(e)));
    }

    function doPause(): void {
        const cfg = loadConfig();
        pause(cfg).then((result) => {
            if (result === "ok") {
                setControlMsg("");
                fetchAll();
            } else {
                setControlMsg("⚠️ " + result);
            }
        }).catch((e) => setControlMsg("❌ " + String(e)));
    }

    function doNext(): void {
        const cfg = loadConfig();
        skipToNext(cfg).then((result) => {
            if (result === "ok") {
                setControlMsg("");
                fetchAll();
            } else {
                setControlMsg("⚠️ " + result);
            }
        }).catch((e) => setControlMsg("❌ " + String(e)));
    }

    function doPrev(): void {
        const cfg = loadConfig();
        skipToPrevious(cfg).then((result) => {
            if (result === "ok") {
                setControlMsg("");
                fetchAll();
            } else {
                setControlMsg("⚠️ " + result);
            }
        }).catch((e) => setControlMsg("❌ " + String(e)));
    }

    function onVolumeChanged(val: number): void {
        setVolumeVal(val);
        volumeRef.current = val;
    }

    function onVolumeEditingChanged(editing: boolean): void {
        if (!editing) {
            const cfg = loadConfig();
            const vol = volumeRef.current;
            setVolume(cfg, vol).then((result) => {
                if (result !== "ok") {
                    setControlMsg("⚠️ 音量: " + result);
                }
            }).catch((e) => setControlMsg("❌ 音量: " + String(e)));
        }
    }

    useEffect(() => {
        if (configReady) {
            fetchAll();
        }
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
                    ],
                    topBarTrailing: [
                        <Button action={() => openDevices()}>
                            <Image systemName="hifispeaker.2" />
                        </Button>,
                        <Button action={() => openSettings()}>
                            <Image systemName="gear" />
                        </Button>,
                        <Button action={() => fetchAll()}>
                            <Image systemName="arrow.clockwise" />
                        </Button>,
                    ],
                }}>
                {(() => {
                    if (!configReady)
                        return (
                            <List>
                                <Section title="歡迎使用龍蝦點唱機 🦞🎵">
                                    <VStack alignment="center" spacing={12} padding>
                                        <Image systemName="music.note.house.fill" font={48} foregroundStyle={"systemGreen"} />
                                        <Text bold font={17}>尚未連接 Spotify</Text>
                                        <Text foregroundStyle="secondaryLabel" font={14}>請先設定您的 Spotify OAuth 憑證</Text>
                                    </VStack>
                                </Section>
                                <Section>
                                    <Button action={() => openSettings()}>
                                        <HStack>
                                            <Image systemName="gear.badge.checkmark" foregroundStyle={"systemGreen"} frame={{ width: 24 }} />
                                            <Text>前往設定 Spotify 帳號</Text>
                                            <Spacer />
                                            <Image systemName="chevron.right" foregroundStyle={"tertiaryLabel"} />
                                        </HStack>
                                    </Button>
                                </Section>
                            </List>
                        );

                    if (isLoading)
                        return (
                            <>
                                <ProgressView progressViewStyle={"circular"} padding />
                                <Spacer />
                            </>
                        );

                    return (
                        <List>
                            {/* 正在播放 */}
                            <Section title="正在播放">
                                {current ? (
                                    <>
                                        <HStack>
                                            <Image
                                                systemName={current.isPlaying ? "play.circle.fill" : "pause.circle.fill"}
                                                foregroundStyle={current.isPlaying ? "systemGreen" : "systemOrange"}
                                                font={24}
                                                frame={{ width: 32 }}
                                            />
                                            <VStack alignment="leading" spacing={2}>
                                                <Text bold lineLimit={1}>{current.name}</Text>
                                                <Text font={13} foregroundStyle="secondaryLabel" lineLimit={1}>{current.artist}</Text>
                                            </VStack>
                                        </HStack>
                                        <HStack>
                                            <Image systemName="opticaldisc" foregroundStyle={"systemPurple"} frame={{ width: 24 }} />
                                            <Text lineLimit={1}>{current.album}</Text>
                                        </HStack>
                                        <HStack>
                                            <Image systemName="timer" foregroundStyle={"systemBlue"} frame={{ width: 24 }} />
                                            <Text>{formatDuration(current.progressMs)} / {formatDuration(current.durationMs)}</Text>
                                        </HStack>
                                    </>
                                ) : (
                                    <HStack>
                                        <Image systemName="speaker.slash" foregroundStyle={"systemGray"} frame={{ width: 24 }} />
                                        <Text foregroundStyle="secondaryLabel">目前沒有在播放音樂 🎵</Text>
                                    </HStack>
                                )}
                            </Section>

                            {/* 播放控制 */}
                            <Section title="控制">
                                <HStack alignment="center">
                                    <Spacer />
                                    <Button action={() => doPrev()} buttonStyle="plain">
                                        <VStack alignment="center" spacing={4}>
                                            <Image systemName="backward.fill" font={24} foregroundStyle={"label"} />
                                            <Text font={10} foregroundStyle="secondaryLabel">上一首</Text>
                                        </VStack>
                                    </Button>
                                    <Spacer />
                                    {current?.isPlaying ? (
                                        <Button action={() => doPause()} buttonStyle="plain">
                                            <VStack alignment="center" spacing={4}>
                                                <Image systemName="pause.fill" font={40} foregroundStyle={"systemGreen"} />
                                                <Text font={10} foregroundStyle="secondaryLabel">暫停</Text>
                                            </VStack>
                                        </Button>
                                    ) : (
                                        <Button action={() => doPlay()} buttonStyle="plain">
                                            <VStack alignment="center" spacing={4}>
                                                <Image systemName="play.fill" font={40} foregroundStyle={"systemGreen"} />
                                                <Text font={10} foregroundStyle="secondaryLabel">播放</Text>
                                            </VStack>
                                        </Button>
                                    )}
                                    <Spacer />
                                    <Button action={() => doNext()} buttonStyle="plain">
                                        <VStack alignment="center" spacing={4}>
                                            <Image systemName="forward.fill" font={24} foregroundStyle={"label"} />
                                            <Text font={10} foregroundStyle="secondaryLabel">下一首</Text>
                                        </VStack>
                                    </Button>
                                    <Spacer />
                                </HStack>
                                {controlMsg.length > 0 ? (
                                    <Text font={13} foregroundStyle="secondaryLabel">{controlMsg}</Text>
                                ) : null}
                            </Section>

                            {/* 音量 */}
                            <Section title={"音量 " + Math.round(volume) + "%"}>
                                <HStack spacing={10}>
                                    <Image systemName="speaker.fill" foregroundStyle={"secondaryLabel"} font={14} />
                                    <Slider
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={volume}
                                        tint={"systemGreen"}
                                        onChanged={onVolumeChanged}
                                        onEditingChanged={onVolumeEditingChanged}
                                        label={<VStack />}
                                    />
                                    <Image systemName="speaker.wave.3.fill" foregroundStyle={"secondaryLabel"} font={14} />
                                </HStack>
                            </Section>

                            {/* 最近播放 */}
                            <Section title={"最近播放（" + recent.length + "）"}>
                                {recent.length === 0 ? (
                                    <Text foregroundStyle="secondaryLabel">沒有播放紀錄</Text>
                                ) : (
                                    recent.map((track, i) => (
                                        <HStack key={"recent-" + i} alignment="center" spacing={8}>
                                            <VStack
                                                alignment="leading"
                                                spacing={2}
                                                frame={{ maxWidth: "infinity", alignment: "leading" }}>
                                                <Text lineLimit={1}>{track.name}</Text>
                                                <Text lineLimit={1} font="caption" foregroundStyle="secondaryLabel">
                                                    {track.artist} · {track.album}
                                                </Text>
                                            </VStack>
                                            <Text font={11} foregroundStyle="tertiaryLabel">
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
