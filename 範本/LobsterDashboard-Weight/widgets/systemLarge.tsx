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
    const {
        status,
        reputation,
        threads,
        btc,
        disk,
        moltbook,
        api_health,
    } = data;

    const dividerLength = 37;

    return (
        <VStack padding>
            <HStack padding={{ leading: true, trailing: true }}>
                <VStack alignment={"leading"}>
                    <Text bold font={32}>
                        🦞 龍蝦哨兵
                    </Text>
                    <Text foregroundStyle="secondaryLabel">{status}</Text>
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
                    color="systemIndigo"
                />
            </HStack>
            <Spacer />
            <HStack padding={{ bottom: true }}>
                <ApiStatusView
                    title="Threads"
                    status={api_health.threads}
                />
                <Divider frame={{ height: dividerLength }} />
                <ApiStatusView
                    title="Tasks"
                    status={api_health.clawtasks}
                />
                <Divider frame={{ height: dividerLength }} />
                <ApiStatusView
                    title="OpenClaw"
                    status={api_health.openclaw}
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

function ApiStatusView({
    title,
    status,
}: {
    title: string;
    status: string;
}) {
    const color: Color =
        status === "Healthy" || status === "Online"
            ? "systemGreen"
            : status === "Blocked"
            ? "systemOrange"
            : "systemRed";
    const icon =
        status === "Healthy" || status === "Online"
            ? "checkmark.circle.fill"
            : status === "Blocked"
            ? "exclamationmark.triangle.fill"
            : "xmark.circle.fill";
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
                {status}
            </Text>
        </VStack>
    );
}
