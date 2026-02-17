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
import { NewsItem } from "./types";
import { fetchNews } from "./rss";

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "剛剛";
    if (diffMin < 60) return `${diffMin} 分鐘前`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} 小時前`;
    return `${Math.floor(diffHr / 24)} 天前`;
}

function NewsDetailPage({ item }: { item: NewsItem }) {
    return (
        <List navigationTitle={item.source || "新聞"} navigationBarTitleDisplayMode="inline">
            <Section title="標題">
                <Text font={17} bold>{item.title}</Text>
            </Section>
            <Section title="來源">
                <HStack>
                    <Image
                        systemName="building.2.fill"
                        foregroundStyle={"systemBlue"}
                        frame={{ width: 24 }}
                    />
                    <Text>{item.source || "未知來源"}</Text>
                </HStack>
                <HStack>
                    <Image
                        systemName="clock.fill"
                        foregroundStyle={"systemOrange"}
                        frame={{ width: 24 }}
                    />
                    <Text>{formatTimeAgo(item.pubDate)}</Text>
                </HStack>
            </Section>
            <Section title="連結">
                <Text foregroundStyle="secondaryLabel" font={13} lineLimit={3}>
                    {item.link}
                </Text>
            </Section>
        </List>
    );
}

export function NewsListPage() {
    const dismiss = Navigation.useDismiss();

    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const loadNews = async () => {
        setIsLoading(true);
        setErrorMsg("");
        try {
            const items = await fetchNews(15);
            setNews(items);
        } catch (e) {
            setErrorMsg(`載入失敗：${String(e)}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    return (
        <NavigationStack>
            <VStack
                navigationTitle={"🦞 龍蝦新聞台"}
                toolbar={{
                    topBarLeading: [
                        <Button
                            action={() => {
                                dismiss();
                            }}>
                            <Image systemName="xmark" />
                        </Button>,
                    ],
                    topBarTrailing: [
                        <Button
                            action={async () => {
                                await loadNews();
                            }}>
                            <Image systemName="arrow.clockwise" />
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

                    if (errorMsg)
                        return (
                            <VStack padding>
                                <Text foregroundStyle="systemRed">{errorMsg}</Text>
                                <Spacer />
                            </VStack>
                        );

                    return (
                        <List
                            refreshable={async () => {
                                await loadNews();
                            }}>
                            <Section title={`台灣即時頭條（${news.length}）`}>
                                {news.map((item, index) => (
                                    <NavigationLink
                                        key={`news-${index}`}
                                        destination={<NewsDetailPage item={item} />}>
                                        <VStack alignment="leading" spacing={4}>
                                            <Text lineLimit={2} bold>
                                                {item.title}
                                            </Text>
                                            <HStack>
                                                <Text
                                                    font={12}
                                                    foregroundStyle="secondaryLabel">
                                                    {item.source}
                                                </Text>
                                                <Spacer />
                                                <Text
                                                    font={12}
                                                    foregroundStyle="tertiaryLabel">
                                                    {formatTimeAgo(item.pubDate)}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </NavigationLink>
                                ))}
                            </Section>
                        </List>
                    );
                })()}
            </VStack>
        </NavigationStack>
    );
}
