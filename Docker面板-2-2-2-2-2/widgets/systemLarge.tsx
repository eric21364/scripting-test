import {
    Text,
    VStack,
    HStack,
    Image,
    Color,
    Divider,
    Spacer,
    Button,
} from "scripting";
import { DockerInfoData } from "./type";
import { reloadWidget } from "../app_intents";
import { formatMemory } from "../utils/format";

export function View({ data }: { data: DockerInfoData }) {
    const {
        Name,
        Version,
        CPUs,
        Memory,
        Containers,
        Running,
        Stopped,
        Images,
        OperatingSystem,
        OSType,
        Architecture,
    } = data;

    const dividerLength = 37;

    return (
        <VStack padding>
            <HStack padding={{ leading: true, trailing: true }}>
                <VStack alignment={"leading"}>
                    <Text bold font={32}>
                        {Name}
                    </Text>
                    <Text foregroundStyle="secondaryLabel">{Version}</Text>
                </VStack>

                <Spacer />

                <Button buttonStyle={"plain"} intent={reloadWidget(undefined)}>
                    <Image
                        font={24}
                        systemName={"arrow.clockwise"}
                        foregroundStyle={"accentColor"}
                    />
                </Button>
            </HStack>

            <Divider />
            <Spacer />
            <HStack>
                <ArgView
                    icon="play"
                    title="运行"
                    body={Running.toString()}
                    color="systemGreen"
                />
                <Divider frame={{ height: dividerLength }} />
                <ArgView
                    icon="stop"
                    title="停止"
                    body={Stopped.toString()}
                    color="systemRed"
                />
                <Divider frame={{ height: dividerLength }} />
                <ArgView
                    icon="cube.box"
                    title="总计"
                    body={Containers.toString()}
                    color="label"
                />
            </HStack>
            <Spacer />
            <HStack>
                <ArgView
                    icon="cpu"
                    title="CPU"
                    body={CPUs.toString()}
                    color="systemOrange"
                />
                <Divider frame={{ height: dividerLength }} />
                <ArgView
                    icon="memorychip"
                    title="内存"
                    body={formatMemory(Memory)}
                    color="systemPurple"
                />
                <Divider frame={{ height: dividerLength }} />
                <ArgView
                    icon="cube"
                    title="镜像"
                    body={Images.toString()}
                    color="systemBlue"
                />
            </HStack>
            <Spacer />
            <HStack padding={{ bottom: true }}>
                <ArgView
                    icon="gearshape"
                    title="系统"
                    body={OperatingSystem}
                    color="systemGray"
                />
                <Divider frame={{ height: dividerLength }} />
                <ArgView
                    icon="doc.plaintext"
                    title="类型"
                    body={OSType}
                    color="systemIndigo"
                />
                <Divider frame={{ height: dividerLength }} />
                <ArgView
                    icon="cube.transparent"
                    title="架构"
                    body={Architecture}
                    color="systemBrown"
                />
            </HStack>
        </VStack>
    );
}

function ArgView({
    icon,
    title,
    body,
    color,
}: {
    icon: string;
    title: string;
    body: string;
    color: Color;
}) {
    return (
        <VStack>
            <HStack foregroundStyle={"secondaryLabel"}>
                <Spacer />
                <Image systemName={icon} />
                <Text>{title}</Text>
                <Spacer />
            </HStack>
            <Text
                bold
                foregroundStyle={color}
                padding={{ top: 4 }}
                lineLimit={1}
                allowsTightening={true}>
                {body}
            </Text>
        </VStack>
    );
}
