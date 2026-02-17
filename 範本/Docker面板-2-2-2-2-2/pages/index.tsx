import {
  NavigationStack,
  NavigationLink,
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
import { StackView } from "./stack";
import { SettingView } from "./setting";
import { getAllStacks } from "../utils/docker";
import { sshExecuteCommand } from "../utils/ssh";
import { getProfile, Profile } from "./setting";
import { AddView } from "./add";

export function View() {
  const dismiss = Navigation.useDismiss();

  const [items, setItems] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile>(getProfile());

  const fetchItems = async () => {
    const items = await getAllStacks();
    setItems(items);
  };

  useEffect(() => {
    async function initSetting() {
      while (true) {
        const newProfile = getProfile();

        const { ssh } = newProfile;
        const { host, port, username, password } = ssh;

        if (host === "" || username === "" || password === "") {
          await Navigation.present(<SettingView />);
        } else {
          break;
        }
      }
    }

    const load = async () => {
      await initSetting();
      setProfile(getProfile());

      console.log("profile", profile);

      await fetchItems();
      setIsLoading(false);
    };
    load();
  }, [profile]);

  const { compose } = profile;
  const { stackPath } = compose;

  return (
    <NavigationStack>
      <VStack
        navigationTitle={"Compose"}
        toolbar={{
          topBarLeading: [
            <Button
              action={() => {
                dismiss();
              }}>
              <Image systemName="xmark" />
            </Button>,
            <Button
              // frame={{ width: 36 }}
              action={async () => {
                await Navigation.present(<SettingView />);
              }}>
              <HStack>
                <Image systemName="gear" />
                {/* <Text>Setting</Text> */}
              </HStack>
            </Button>,
          ],
          topBarTrailing: [
            <Button
              action={async () => {
                // const content = await editorView("");
                // if (content !== "") {
                //     await Dialog.prompt({
                //         title: "添加堆栈",
                //         placeholder: "请输入堆栈名称",
                //     }).then(async (name) => {
                //         if (name) {
                //             await sshExecuteCommand(`cd ${stackPath} && mkdir ${name} && printf "%s" "${content}" > ${name}/compose.yaml && docker compose create`);
                //             await fetchItems();
                //         }
                //     });
                // }

                await Navigation.present(
                  <AddView
                    onChange={async (name: string, content: string) => {
                      await sshExecuteCommand(
                        `cd ${stackPath} && mkdir ${name} && printf "%s" "${content}" > ${name}/compose.yaml && docker compose create`
                      );
                      await fetchItems();
                    }}
                  />
                );
              }}>
              <Image systemName="plus" />
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
          const runningSectionChildren: any[] = [];
          const pausedSectionChildren: any[] = [];

          items.forEach(
            (
              { name, status }: { name: string; status: string },
              index: number
            ) => {
              const trailingActions = {
                allowsFullSwipe: false,
                actions: [
                  <Button
                    title="删除"
                    role="destructive"
                    action={async () => {
                      await sshExecuteCommand(
                        `cd ${stackPath} && rm -rf ${name}`
                      );
                      await fetchItems();
                    }}
                  />,
                  <Button
                    title="重命名"
                    action={async () => {
                      const newName = await Dialog.prompt({
                        title: "重命名",
                        placeholder: "请输入新名称",
                        defaultValue: name,
                      });
                      if (newName && newName !== name) {
                        await sshExecuteCommand(
                          `cd ${stackPath} && mv ${name} ${newName}`
                        );
                        await fetchItems();
                      }
                    }}
                  />,
                ],
              };

              const leadingActions: any =
                status === "paused"
                  ? // 已退出 → 只有启动
                    {
                      allowsFullSwipe: true,
                      actions: [
                        <Button
                          title="启动"
                          tint="accentColor"
                          action={async () => {
                            setItems((prev: any) => {
                              const newItems = [...prev];
                              newItems[index] = {
                                ...newItems[index],
                                status: "loading",
                              };
                              return newItems;
                            });
                            await sshExecuteCommand(
                              `cd ${stackPath}/${name} && docker compose up -d`
                            );
                            setItems((prev: any) => {
                              const newItems = [...prev];
                              newItems[index] = {
                                ...newItems[index],
                                status: "running",
                              };
                              return newItems;
                            });
                          }}
                        />,
                        <Button
                          title="更新"
                          action={async () => {
                            setItems((prev: any) => {
                              const newItems = [...prev];
                              newItems[index] = {
                                ...newItems[index],
                                status: "updating_paused",
                              };
                              return newItems;
                            });
                            await sshExecuteCommand(
                              `cd ${stackPath}/${name} && docker compose pull`
                            );
                            setItems((prev: any) => {
                              const newItems = [...prev];
                              newItems[index] = {
                                ...newItems[index],
                                status: "paused",
                              };
                              return newItems;
                            });
                          }}
                        />,
                      ],
                    }
                  : // 已启动 → 重启 + 暂停
                    {
                      allowsFullSwipe: true,
                      actions: [
                        <Button
                          title="暂停"
                          tint="accentColor"
                          action={async () => {
                            setItems((prev: any) => {
                              const newItems = [...prev];
                              newItems[index] = {
                                ...newItems[index],
                                status: "loading",
                              };
                              return newItems;
                            });
                            await sshExecuteCommand(
                              `cd ${stackPath}/${name} && docker compose stop`
                            );
                            setItems((prev: any) => {
                              const newItems = [...prev];
                              newItems[index] = {
                                ...newItems[index],
                                status: "paused",
                              };
                              return newItems;
                            });
                          }}
                        />,
                        <Button
                          title="重启"
                          tint="systemGreen"
                          action={async () => {
                            setItems((prev: any) => {
                              const newItems = [...prev];
                              newItems[index] = {
                                ...newItems[index],
                                status: "restarting",
                              };
                              return newItems;
                            });
                            await sshExecuteCommand(
                              `cd ${stackPath}/${name} && docker compose restart`
                            );
                            setItems((prev: any) => {
                              const newItems = [...prev];
                              newItems[index] = {
                                ...newItems[index],
                                status: "running",
                              };
                              return newItems;
                            });
                          }}
                        />,
                        <Button
                          title="更新"
                          action={async () => {
                            setItems((prev: any) => {
                              const newItems = [...prev];
                              newItems[index] = {
                                ...newItems[index],
                                status: "updating_running",
                              };
                              return newItems;
                            });
                            await sshExecuteCommand(
                              `cd ${stackPath}/${name} && docker compose pull && docker compose up`
                            );
                            setItems((prev: any) => {
                              const newItems = [...prev];
                              newItems[index] = {
                                ...newItems[index],
                                status: "running",
                              };
                              return newItems;
                            });
                          }}
                        />,
                      ],
                    };

              const getStatusIcon = (status: string) => {
                switch (status) {
                  case "running":
                    return "play.fill";
                  case "paused":
                    return "pause.fill";
                  case "loading":
                    return "arrow.clockwise";
                  case "restarting":
                    return "arrow.2.circlepath";
                  case "updating_paused":
                  case "updating_running":
                    return "icloud.and.arrow.down";
                  default:
                    return "questionmark";
                }
              };

              const getStatusOpacity = (status: string) => {
                switch (status) {
                  case "loading":
                  case "restarting":
                  case "updating_paused":
                  case "updating_running":
                    return 0.5;

                  default:
                    return 1;
                }
              };

              const node = (
                <NavigationLink
                  key={name}
                  destination={<StackView name={name} />}
                  leadingSwipeActions={leadingActions}
                  trailingSwipeActions={trailingActions}>
                  <Image
                    frame={{ width: 24 }}
                    opacity={getStatusOpacity(status)}
                    systemName={getStatusIcon(status)}
                    contentTransition="symbolEffectAutomatic"
                  />
                  <Text>{name}</Text>
                </NavigationLink>
              );

              // 分类放入对应 section
              if (status === "paused" || status === "updating_paused") {
                pausedSectionChildren.push(node);
              } else {
                runningSectionChildren.push(node);
              }
            }
          );

          return (
            <List
              refreshable={async () => {
                const items: string[] = await getAllStacks();
                setItems(items);
              }}>
              <Section title="已启动">{runningSectionChildren}</Section>
              <Section title="已退出">{pausedSectionChildren}</Section>
            </List>
          );
        })()}
      </VStack>
    </NavigationStack>
  );
}
