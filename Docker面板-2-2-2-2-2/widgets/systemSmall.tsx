import {
    Text,
    VStack,
    HStack,
    Image,
    Color,
    Divider,
    Spacer,
    ZStack,
} from "scripting";
import { DockerInfoData } from "./type";
import { formatMemory } from "../utils/format";

export function View({ data }: { data: DockerInfoData }) {
    const { CPUs, Memory, Running, Stopped } = data;
    return (
        <ZStack>
            <VStack>
                <Spacer />
                <HStack>
                    <ArgView
                        icon="play"
                        title="运行"
                        body={Running.toString()}
                        color="systemGreen"
                    />
                    <ArgView
                        icon="stop"
                        title="停止"
                        body={Stopped.toString()}
                        color="systemRed"
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
                    <ArgView
                        icon="memorychip"
                        title="内存"
                        body={formatMemory(Memory)}
                        color="systemPurple"
                    />
                </HStack>
                <Spacer />
            </VStack>
            <Divider padding />
            <Divider padding rotationEffect={90} />
        </ZStack>
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
            <HStack foregroundStyle={"secondaryLabel"} font={13}>
                <Spacer />
                <Image systemName={icon} />
                <Text>{title}</Text>
                <Spacer />
            </HStack>
            <Text
                bold
                foregroundStyle={color}
                padding={{ top: 2 }}
                lineLimit={1}
                allowsTightening={true}>
                {body}
            </Text>
        </VStack>
    );
}
