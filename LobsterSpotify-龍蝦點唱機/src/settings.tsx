import {
    HStack,
    Divider,
    TextField,
    Text,
    Section,
    List,
    Navigation,
    NavigationStack,
    Button,
    Spacer,
    Image,
    useState,
    Script,
} from "scripting";
import { SpotifyConfig } from "./types";
import { loadConfig, saveConfig, isConfigReady, getCurrentlyPlaying } from "./spotify";

export function SettingsPage(): JSX.Element {
    const dismiss = Navigation.useDismiss();

    const [config, setConfig] = useState<SpotifyConfig>(loadConfig());
    const [testMsg, setTestMsg] = useState<string>("");
    const [testing, setTesting] = useState<boolean>(false);

    const titleMap: Record<keyof SpotifyConfig, string> = {
        clientId: "Client ID",
        clientSecret: "Secret",
        refreshToken: "Refresh Token",
    };

    function updateField<K extends keyof SpotifyConfig>(key: K, val: string) {
        setConfig((prev) => ({
            ...prev,
            [key]: val,
        }));
    }

    const blockWidth = 96;

    return (
        <NavigationStack>
            <List
                navigationTitle={"Spotify 設定"}
                toolbar={{
                    topBarLeading: [
                        <Button
                            action={() => {
                                saveConfig(config);
                                dismiss();
                            }}>
                            <Text>儲存</Text>
                        </Button>,
                    ],
                }}>
                <Section title={"OAuth 憑證"}>
                    {(Object.keys(config) as (keyof SpotifyConfig)[]).map(
                        (item) => (
                            <HStack key={item}>
                                <HStack frame={{ width: blockWidth }}>
                                    <Text>{titleMap[item]}</Text>
                                    <Spacer />
                                </HStack>
                                <Divider />
                                <TextField
                                    title={titleMap[item]}
                                    prompt={titleMap[item]}
                                    value={config[item]}
                                    onChanged={(val: string) => updateField(item, val)}
                                />
                            </HStack>
                        )
                    )}
                </Section>
                <Section title={"連線測試"}>
                    <Button
                        action={async () => {
                            if (!isConfigReady(config)) {
                                setTestMsg("請先填寫所有欄位");
                                return;
                            }
                            setTesting(true);
                            setTestMsg("測試連線中...");
                            try {
                                saveConfig(config);
                                const track = await getCurrentlyPlaying(config);
                                if (track) {
                                    setTestMsg(`✅ 成功！正在播放: ${track.name}`);
                                } else {
                                    setTestMsg("✅ 連線成功！目前沒有在播放");
                                }
                            } catch (e) {
                                setTestMsg(`❌ 失敗: ${String(e)}`);
                            } finally {
                                setTesting(false);
                            }
                        }}
                        disabled={testing}>
                        <HStack>
                            <Image
                                systemName="antenna.radiowaves.left.and.right"
                                foregroundStyle={"systemGreen"}
                            />
                            <Text>{testing ? "測試中..." : "測試 Spotify 連線"}</Text>
                        </HStack>
                    </Button>
                    {testMsg.length > 0 ? (
                        <Text font={13} foregroundStyle="secondaryLabel">
                            {testMsg}
                        </Text>
                    ) : null}
                </Section>
            </List>
        </NavigationStack>
    );
}
