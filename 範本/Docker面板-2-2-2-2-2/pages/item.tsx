import { Button, ControlGroup, List, Section, HStack, Image, TextField, Picker, Spacer, Divider, Text, ProgressView, useEffect, useState, NavigationStack, Navigation } from "scripting";
import { getDockerStatus, setDockerStatus } from "../utils/docker";
import { editorView } from "../utils/editor";
import { dump as yamlDump, load as yamlLoad } from "../module/js-yaml";
import { getProfile } from "../pages/setting";

const { host } = getProfile().ssh;

interface ComposeItemProps {
    stackName: string;
    serviceName: string;
    serviceData: any;
    onClose: (val: object) => void;
}

const statusMap: Record<string, string> = {
    running: "运行中",
    stopped: "已停止",
    updating: "更新中",
    starting: "启动中",
    stopping: "停止中",
    restarting: "重启中",
};

export function ComposeItemView({ stackName, serviceName, serviceData, onClose }: ComposeItemProps) {
    const dismiss = Navigation.useDismiss();

    const [status, setStatus] = useState<string>("loading");
    const [yamlJson, setYamlJson] = useState<any>(serviceData);

    const updateYamlField = (key: string, value: any) => {
        setYamlJson((prev: any) => {
            const updated = { ...prev, [key]: value };
            return updated;
        });
    };

    const fetchStatus = async () => {
        const statusResult = await getDockerStatus(stackName, serviceName);
        setStatus(statusResult?.trim() || "stopped");
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    return (
        <NavigationStack>
            <List
                refreshable={async () => {
                    await fetchStatus();
                }}
                toolbar={{
                    topBarLeading: [
                        <Button
                            action={async () => {
                                dismiss();
                                onClose(yamlJson);
                            }}>
                            <Text>保存</Text>
                        </Button>,
                    ],
                    topBarTrailing: [
                        <ControlView
                            stackName={stackName}
                            serviceName={serviceName}
                            status={status}
                            onChange={(val) => {
                                setStatus(val);
                            }}
                        />,
                        <Button
                            action={async () => {
                                const content = await editorView(yamlDump(yamlJson));
                                if (content) {
                                    setYamlJson(yamlLoad(content));
                                }
                            }}>
                            <Image systemName="square.and.pencil" />
                        </Button>,
                    ],
                }}>
                <Section
                    header={
                        <HStack>
                            <Text>容器信息</Text>
                            <Spacer />
                            {status === "loading" ? <ProgressView progressViewStyle="circular" frame={{ height: 1 }} /> : <Text>{statusMap[status]}</Text>}
                        </HStack>
                    }>
                    <InputRow label="容器名称" key="container" value={yamlJson?.container_name} prompt={serviceName} onChange={(val) => updateYamlField("container_name", val)} />
                    <InputRow label="镜像名称" key="image" value={yamlJson?.image} prompt={"镜像名称"} onChange={(val) => updateYamlField("image", val)} />
                </Section>

                <Section title="模式选择">
                    <PickerView label="网络模式" value={yamlJson?.network_mode || "bridge"} list={["bridge", "host", "none", "container"]} onChange={(val) => updateYamlField("network_mode", val)} />
                    <PickerView label="重启模式" value={yamlJson?.restart || "unless-stopped"} list={["no", "always", "on-failure", "unless-stopped"]} onChange={(val) => updateYamlField("restart", val)} />
                </Section>

                <PairListView
                    title="端口映射"
                    keyPlaceholder="容器端口"
                    valuePlaceholder="主机端口"
                    showOpenButton
                    value={(yamlJson?.ports || [""]).map((v: any) => v.split(":") as [string, string])}
                    onConfirm={(pairs) =>
                        updateYamlField(
                            "ports",
                            pairs.map(([c, h]) => `${c}:${h}`)
                        )
                    }
                />

                <PairListView
                    title="挂载数据"
                    keyPlaceholder="容器路径"
                    valuePlaceholder="主机路径"
                    showOpenButton
                    value={(yamlJson?.volumes || [""]).map((v: any) => v.split(":") as [string, string])}
                    onConfirm={(pairs) =>
                        updateYamlField(
                            "volumes",
                            pairs.map(([c, h]) => `${c}:${h}`)
                        )
                    }
                />

                <PairListView
                    title="环境变量"
                    value={Array.isArray(yamlJson?.environment) ? (yamlJson.environment.length ? yamlJson.environment.map((e: any) => e.split("=") as [string, string]) : [["", ""]]) : Object.entries(yamlJson?.environment || { "": "" })}
                    onConfirm={(pairs) =>
                        updateYamlField(
                            "environment",
                            pairs.map(([k, v]) => `${k}=${v}`)
                        )
                    }
                    keyPlaceholder="变量名"
                    valuePlaceholder="变量值"
                />
            </List>
        </NavigationStack>
    );
}

interface InputRowProps {
    label: string;
    value: string;
    prompt?: string;
    onChange: (val: string) => void;
}

function InputRow({ label, value, prompt, onChange }: InputRowProps) {
    const [val, setVal] = useState(value);

    return (
        <HStack>
            <Text>{label}</Text>
            <TextField title={label} prompt={prompt} multilineTextAlignment="trailing" value={val} onChanged={setVal} onBlur={() => onChange(val)} />
        </HStack>
    );
}

interface PickerViewProps {
    label: string;
    value: string;
    list: string[];
    onChange: (val: string) => void;
}

function PickerView({ label, value, list, onChange }: PickerViewProps) {
    const options = list.includes(value) ? list : [...list, value];

    if (!value) return <></>;

    return (
        <Picker label={<Text>{label}</Text>} pickerStyle="menu" value={value} onChanged={onChange}>
            {options.map((item) => (
                <Text tag={item} key={item}>
                    {item}
                </Text>
            ))}
        </Picker>
    );
}

interface PairListViewProps {
    title: string;
    value: [string, string][]; // 已处理好的二维数组
    onConfirm: (val: [string, string][]) => void;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    showOpenButton?: boolean;
}

function PairListView({ title, keyPlaceholder, valuePlaceholder, value, onConfirm, showOpenButton = false }: PairListViewProps) {
    const handleChange = (idx: number, newPair: [string, string]) => {
        const updated = [...value];
        updated[idx] = newPair;
        onConfirm(updated);
    };

    const deleteItem = (idx: number) => {
        const updated = value.filter((_, i) => i !== idx);
        onConfirm(updated.length > 0 ? updated : [["", ""]]);
    };

    return (
        <Section
            header={
                <HStack>
                    <Text>{title}</Text>
                    <Spacer />
                    <Button action={() => onConfirm([...value, ["", ""]])}>
                        <Image systemName="plus" />
                    </Button>
                </HStack>
            }>
            {value.map(([k, v], idx) => (
                <HStack
                    key={idx}
                    leadingSwipeActions={
                        showOpenButton
                            ? {
                                  allowsFullSwipe: true,
                                  actions: [
                                      <Button
                                          title="打开"
                                          action={async () => {
                                              await Safari.present(`http://${host}:${v}`);
                                          }}
                                      />,
                                  ],
                              }
                            : undefined
                    }
                    trailingSwipeActions={{
                        allowsFullSwipe: false,
                        actions: [<Button title="删除" role="destructive" action={() => deleteItem(idx)} />],
                    }}>
                    <TextField title={keyPlaceholder || "Key"} prompt={keyPlaceholder} value={k} onChanged={(newK) => handleChange(idx, [newK, v])} onBlur={() => {}} autofocus={k === ""} />
                    <Divider />
                    <TextField title={valuePlaceholder || "Value"} prompt={valuePlaceholder} value={v} onChanged={(newV) => handleChange(idx, [k, newV])} onBlur={() => {}} />
                </HStack>
            ))}
        </Section>
    );
}

interface ControlViewProps {
    stackName: string;
    serviceName: string;
    status: string;
    onChange: (v: string) => void;
}

function ControlView({ stackName, serviceName, status, onChange }: ControlViewProps) {
    const [loading, setLoading] = useState(false);

    const optionsMap = {
        start: { label: "启动", icon: "play.fill" },
        stop: { label: "停止", icon: "stop.fill" },
        restart: { label: "重启", icon: "arrow.2.circlepath" },
        update: { label: "更新", icon: "icloud.and.arrow.down" },
    };

    const handleClick = async (cmd: keyof typeof optionsMap) => {
        // 改变状态时
        if (cmd === "start" || cmd === "restart") {
            onChange("restarting");
        } else if (cmd === "update") {
            onChange("updating");
        } else {
            onChange("stopping");
        }

        setLoading(true);
        await setDockerStatus(stackName, serviceName, status, cmd);
        setLoading(false);

        // 操作完成后回调，保持父组件状态同步
        const finalStatus = (() => {
            switch (cmd) {
                case "start":
                case "restart":
                    return "running";
                case "stop":
                    return "stopped";
                case "update":
                    return status;
                default:
                    return status;
            }
        })();

        onChange(finalStatus);
    };

    const convertToDisabled = (item: keyof typeof optionsMap, status: string) => {
        switch (item) {
            case "start":
                return status === "running";
            case "stop":
            case "restart":
                return status === "stopped" || status === "exited";
            default:
                return false;
        }
    };

    return (
        <ControlGroup title="容器操作" systemImage="ellipsis.circle" controlGroupStyle="menu">
            {Object.keys(optionsMap).map((item) => (
                <Button
                    key={item}
                    title={optionsMap[item as keyof typeof optionsMap].label}
                    systemImage={optionsMap[item as keyof typeof optionsMap].icon}
                    disabled={loading || convertToDisabled(item as keyof typeof optionsMap, status)}
                    action={async () => {
                        await handleClick(item as keyof typeof optionsMap);
                    }}
                />
            ))}
        </ControlGroup>
    );
}
