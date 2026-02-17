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
  compose: {
    stackPath: string;
  };
};

export function SettingView(): JSX.Element {
  const dismiss = Navigation.useDismiss();

  const [profile, setProfile] = useState<Profile>(getProfile());

  const sshTitleMap: Record<keyof Profile["ssh"], string> = {
    host: "主机",
    port: "端口",
    username: "用户名",
    password: "密码",
  };

  const composeTitleMap: Record<keyof Profile["compose"], string> = {
    stackPath: "堆栈路径",
  };

  // 更新函数，确保不直接修改状态对象
  function updateSSHField<K extends keyof Profile["ssh"]>(key: K, val: string) {
    setProfile((prev) => ({
      ...prev,
      ssh: {
        ...prev.ssh,
        [key]: key === "port" ? Number(val) : val,
      },
    }));
  }

  function updateComposeField<K extends keyof Profile["compose"]>(
    key: K,
    val: string
  ) {
    setProfile((prev) => ({
      ...prev,
      compose: {
        ...prev.compose,
        [key]: val,
      },
    }));
  }

  const blockWidth = 76;
  return (
    <NavigationStack>
      <List
        navigationTitle={"设置"}
        toolbar={{
          topBarLeading: [
            <Button
              frame={{ width: 36 }}
              action={() => {
                Storage.set(key, profile);
                dismiss();
              }}>
              <HStack>
                {/* <Image systemName="checkmark" /> */}
                <Text>保存</Text>
              </HStack>
            </Button>,
          ],
        }}>
        <Section title={"SSH"}>
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
        <Section title={"Compose"}>
          {(Object.keys(profile.compose) as (keyof Profile["compose"])[]).map(
            (item) => (
              <HStack key={item}>
                <HStack frame={{ width: blockWidth }}>
                  <Text>{composeTitleMap[item]}</Text>
                  <Spacer />
                </HStack>
                <Divider />
                <TextField
                  title={composeTitleMap[item]}
                  prompt={composeTitleMap[item]}
                  value={profile.compose[item]}
                  onChanged={(val: string) => updateComposeField(item, val)}
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
    compose: {
      stackPath: "",
    },
  };
  return profile;
}
