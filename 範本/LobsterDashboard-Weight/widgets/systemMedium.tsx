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
import { LobsterStatusData } from "./type";
import { reloadWidget } from "../app_intents";

export function View({ data }: { data: LobsterStatusData }) {
    const { status, reputation, threads, btc, disk, moltbook } = data;
    const dividerLength = 27;
    return (
        <VStack padding>
            <HStack padding={{ leading: true, trailing: true }}>
                <Text bold>🦞 龍蝦哨兵</Text>
                <Spacer />
                <Button buttonStyle={"plain"} intent={reloadWidget(undefined)}>
                    <Image
                        systemName={"arrow.clockwise"}
                        foregroundStyle={"accentColor"}
                    />
                </Button>
                <Text foregroundStyle="secondaryLabel">{status}</Text>
            </HStack>
            <Spacer />
            <HStack>
                <ArgView
                    icon="star.fill"
                    title="聲望"
                    body={reputation.toString()}
                    color="systemOrange"
                />
                <Divider frame={{ height: dividerLength }} />
                <ArgView
                    icon="text.bubble.fill"
                    title="連載"
                    body={threads}
                    color="systemPurple"
                />
                <Divider frame={{ height: dividerLength }} />
                <ArgView
                    icon="bitcoinsign.circle"
                    title="BTC"
                    body={btc}
                    color="systemYellow"
                />
            </HStack>
            <Spacer />
            <HStack>
                <ArgView
                    icon="internaldrive.fill"
                    title="磁碟"
                    body={disk}
                    color="systemGreen"
                />
                <Divider frame={{ height: dividerLength }} />
                <ArgView
                    icon="person.crop.circle"
                    title="Moltbook"
                    body={moltbook}
                    color="systemRed"
                />
                <Divider frame={{ height: dividerLength }} />
                <ArgView
                    icon="shield.checkered"
                    title="資安"
                    body="S+"
                    color="systemBlue"
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
                lineLimit={1}
                allowsTightening={true}>
                {body}
            </Text>
        </VStack>
    );
}
