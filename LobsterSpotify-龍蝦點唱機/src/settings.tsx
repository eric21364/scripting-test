import {
    HStack,
    Divider,
    TextField,
    SecureField,
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

    const blockWidth = 96;

    async function testConnection(): Promise<void> {
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
                setTestMsg(`✅ 連線成功！正在播放: ${track.name}`);
            } else {
                setTestMsg("✅ 連線成功！目前沒有在播放音樂");
            }
        } catch (e) {
            setTestMsg(`❌ 連線失敗: ${String(e)}`);
        } finally {
            setTesting(false);
        }
    }

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
                <Section title="OAuth 憑證" footer="從 Spotify Developer Dashboard 取得 Client ID 與 Secret，Refresh Token 需透過 OAuth 流程產生。">
                    <HStack>
                        <HStack frame={{ width: blockWidth }}>
                            <Text>Client ID</Text>
                            <Spacer />
                        </HStack>
                        <Divider />
                        <TextField
                            title="Client ID"
                            prompt="Client ID"
                            value={config.clientId}
                            onChanged={(val: string) =>
                                setConfig((prev) => ({ ...prev, clientId: val }))
                            }
                        />
                    </HStack>
                    <HStack>
                        <HStack frame={{ width: blockWidth }}>
                            <Text>Secret</Text>
                            <Spacer />
                        </HStack>
                        <Divider />
                        <SecureField
                            title="Client Secret"
                            prompt="Client Secret"
                            value={config.clientSecret}
                            onChanged={(val: string) =>
                                setConfig((prev) => ({
                                    ...prev,
                                    clientSecret: val,
                                }))
                            }
                        />
                    </HStack>
                    <HStack>
                        <HStack frame={{ width: blockWidth }}>
                            <Text>Refresh Token</Text>
                            <Spacer />
                        </HStack>
                        <Divider />
                        <SecureField
                            title="Refresh Token"
                            prompt="Refresh Token"
                            value={config.refreshToken}
                            onChanged={(val: string) =>
                                setConfig((prev) => ({
                                    ...prev,
                                    refreshToken: val,
                                }))
                            }
                        />
                    </HStack>
                </Section>
                <Section title="測試連線">
                    <Button
                        action={testConnection}
                        disabled={testing}>
                        <HStack>
                            <Image
                                systemName="antenna.radiowaves.left.and.right"
                                foregroundStyle={"systemGreen"}
                            />
                            <Text>{testing ? "測試中..." : "測試 Spotify 連線"}</Text>
                        </HStack>
                    </Button>
                    {testMsg ? (
                        <Text font={13} foregroundStyle="secondaryLabel">
                            {testMsg}
                        </Text>
                    ) : null}
                </Section>
            </List>
        </NavigationStack>
    );
}
