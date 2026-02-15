import { HStack, Image, Text, List, Section, useState, useEffect, Button, Navigation } from "scripting";
import { getDockerComposeYaml, editDockerComposeYaml } from "../utils/docker";
import { ComposeItemView } from "./item";
import { editorView } from "../utils/editor";
import { dump as yamlDump, load as yamlLoad } from "../module/js-yaml";

// 基于 compose.yaml实现
export function StackView({ name }: { name: string }) {
    const [data, setData] = useState<any>({});

    const fetchComposeYaml = async () => {
        const composeData = await getDockerComposeYaml(name);
        setData(yamlLoad(composeData));
    };

    useEffect(() => {
        fetchComposeYaml();
    }, []);

    const handleSave = async (val: object) => {
        setData(val);
        await editDockerComposeYaml(name, yamlDump(val));
    };

    return (
        <List
            refreshable={async () => {
                await fetchComposeYaml();
            }}
            toolbar={{
                topBarTrailing: [
                    <Button
                        action={async () => {
                            const result = await editorView(yamlDump(data) || "");
                            await handleSave(yamlLoad(result));
                        }}>
                        <HStack>
                            <Image systemName="square.and.pencil" />
                        </HStack>
                    </Button>,
                ],
            }}>
            <Section title={"服务列表"}>
                {Object.keys(data?.services || {}).map((item: string) => (
                    // <NavigationLink destination={<ComposeItemView stackName={name} serverName={item} stackData={data || ""} />}>
                    //     <Text key={item}>{item}</Text>
                    // </NavigationLink>
                    <Button
                        // leadingSwipeActions={{
                        //     allowsFullSwipe: true,
                        //     actions: [<Button title="重启" tint="accentColor" action={async () => {}} />, <Button title="暂停" action={async () => {}} />],
                        // }}
                        // trailingSwipeActions={{
                        //     allowsFullSwipe: false,
                        //     actions: [<Button title="删除" role="destructive" action={async () => {}} />, <Button title="重命名" action={async () => {}} />],
                        // }}
                        action={async () => {
                            await Navigation.present(
                                <ComposeItemView
                                    stackName={name}
                                    serviceName={item}
                                    serviceData={data?.services[item]}
                                    onClose={(val) =>
                                        handleSave({
                                            services: {
                                                ...data.services,
                                                [item]: val,
                                            },
                                        })
                                    }
                                />
                            );
                        }}>
                        <Text>{item}</Text>
                    </Button>
                ))}
            </Section>
        </List>
    );
}
