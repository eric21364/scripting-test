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
    useState,
    Script,
} from "scripting";

const key = Script.name;

export type Profile = {
    ssh: {
        host: string;
        port: number;
        username?: string;
        password?: string;
    };
};

export function SettingView(): JSX.Element {
    const dismiss = Navigation.useDismiss();

    const [profile, setProfile] = useState<Profile>(getProfile());

    const sshTitleMap: Record<keyof Profile["ssh"], string> = {
        host: "主機",
        port: "連接埠",
        username: "使用者名稱",
        password: "密碼",
    };

    function updateSSHField<K extends keyof Profile["ssh"]>(key: K, val: string) {
        setProfile((prev) => ({
            ...prev,
            ssh: {
                ...prev.ssh,
                [key]: key === "port" ? Number(val) : val,
            },
        }));
    }

    const blockWidth = 96;
    return (
        <NavigationStack>
            <List
                navigationTitle={"設定"}
                toolbar={{
                    topBarLeading: [
                        <Button
                            frame={{ width: 36 }}
                            action={() => {
                                Storage.set(key, profile);
                                dismiss();
                            }}>
                            <HStack>
                                <Text>儲存</Text>
                            </HStack>
                        </Button>,
                    ],
                }}>
                <Section title={"SSH 連線"}>
                    {(Object.keys(profile.ssh) as (keyof Profile["ssh"])[]).map(
                        (item) => (
                            <HStack key={item}>
                                <HStack frame={{ width: blockWidth }}>
                                    <Text>{sshTitleMap[item]}</Text>
                                    <Spacer />
                                </HStack>
                                <Divider />
                                <TextField
                                    title={sshTitleMap[item]}
                                    prompt={sshTitleMap[item]}
                                    value={String(profile.ssh[item])}
                                    onChanged={(val: string) => updateSSHField(item, val)}
                                />
                            </HStack>
                        )
                    )}
                </Section>
            </List>
        </NavigationStack>
    );
}

export function getProfile(): Profile {
    const profile = (Storage.get(key) as Profile) || {
        ssh: {
            host: "",
            port: 22,
            username: "",
            password: "",
        },
    };
    return profile;
}
