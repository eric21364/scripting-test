import {
    Widget,
    Text,
    VStack,
    HStack,
    Image,
    Spacer,
    Divider,
    Color,
    Notification,
} from "scripting";
import { fetchNews } from "./src/rss";
import { NewsItem } from "./src/types";

function SmallView({ news }: { news: NewsItem[] }) {
    const item = news[0];
    return (
        <VStack padding>
            <HStack>
                <Image systemName="newspaper.fill" foregroundStyle={"systemOrange"} />
                <Text bold font={12}>龍蝦新聞</Text>
                <Spacer />
            </HStack>
            <Spacer />
            <Text bold lineLimit={3} font={14}>
                {item ? item.title : "載入中..."}
            </Text>
            <Spacer />
            <Text font={10} foregroundStyle="secondaryLabel">
                {item ? item.source : ""}
            </Text>
        </VStack>
    );
}

function MediumView({ news }: { news: NewsItem[] }) {
    const dividerLength = 1;
    return (
        <VStack padding spacing={6}>
            <HStack>
                <Image systemName="newspaper.fill" foregroundStyle={"systemOrange"} />
                <Text bold font={13}>🦞 龍蝦新聞台</Text>
                <Spacer />
                <Text font={10} foregroundStyle="secondaryLabel">台灣即時</Text>
            </HStack>
            <Divider />
            {news.slice(0, 3).map((item, i) => (
                <VStack key={`news-${i}`} alignment="leading" spacing={2}>
                    <Text bold lineLimit={1} font={13}>
                        {item.title}
                    </Text>
                    <Text font={10} foregroundStyle="secondaryLabel">
                        {item.source}
                    </Text>
                </VStack>
            ))}
        </VStack>
    );
}

function LargeView({ news }: { news: NewsItem[] }) {
    return (
        <VStack padding spacing={6}>
            <HStack>
                <Image systemName="newspaper.fill" foregroundStyle={"systemOrange"} />
                <Text bold font={15}>🦞 龍蝦新聞台</Text>
                <Spacer />
                <Text font={11} foregroundStyle="secondaryLabel">台灣即時頭條</Text>
            </HStack>
            <Divider />
            {news.slice(0, 6).map((item, i) => (
                <VStack key={`news-${i}`} alignment="leading" spacing={2}>
                    <Text bold lineLimit={2} font={13}>
                        {item.title}
                    </Text>
                    <HStack>
                        <Text font={10} foregroundStyle="secondaryLabel">
                            {item.source}
                        </Text>
                        <Spacer />
                    </HStack>
                    {i < 5 ? <Divider /> : null}
                </VStack>
            ))}
        </VStack>
    );
}

(async () => {
    const news = await fetchNews(6);
    if (news.length === 0) throw new Error("無法載入新聞");

    switch (Widget.family) {
        case "systemSmall":
            Widget.present(<SmallView news={news} />);
            break;
        case "systemMedium":
            Widget.present(<MediumView news={news} />);
            break;
        case "systemLarge":
            Widget.present(<LargeView news={news} />);
            break;
        default:
            Widget.present(<MediumView news={news} />);
    }
})().catch(async (e) => {
    await Notification.schedule({
        title: "龍蝦新聞台錯誤",
        body: String(e),
    });
    Widget.present(<Text>{String(e)}</Text>);
});
