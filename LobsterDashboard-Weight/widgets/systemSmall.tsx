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
import { LobsterStatusData } from "./type";

export function View({ data }: { data: LobsterStatusData }) {
    const { reputation, threadsDay, status } = data;
    return (
        <ZStack>
            <VStack>
                <Spacer />
                <HStack>
                    <ArgView
                        icon="star.fill"
                        title="聲望"
                        body={reputation.toString()}
                        color="systemOrange"
                    />
                    <ArgView
                        icon="text.bubble.fill"
                        title="連載"
                        body={`Day ${threadsDay}`}
                        color="systemPurple"
                    />
                </HStack>
                <Spacer />
                <HStack>
                    <ArgView
                        icon="bolt.fill"
                        title="狀態"
                        body={status}
                        color="systemGreen"
                    />
                    <ArgView
                        icon="antenna.radiowaves.left.and.right"
                        title="哨兵"
                        body="ON"
                        color="systemBlue"
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
