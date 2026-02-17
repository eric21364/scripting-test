import {
    NavigationStack,
    Image,
    Text,
    List,
    Section,
    HStack,
    VStack,
    Navigation,
    Spacer,
    Button,
    DragGesture,
    ZStack,
    Divider,
    RoundedRectangle,
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

function NewsDetailView({
    news,
    initialIndex,
}: {
    news: NewsItem[];
    initialIndex: number;
}) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const item = news[currentIndex];
    const total = news.length;

    function swipe(deltaX: number): void {
        if (Math.abs(deltaX) < 60) return;
        if (deltaX < 0 && currentIndex < total - 1) {
            setCurrentIndex(currentIndex + 1);
        } else if (deltaX > 0 && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    }

    return (
        <VStack
            frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
            simultaneousGesture={DragGesture({ minDistance: 24 }).onEnded((event) => {
                const dx = event.translation.width;
                const dy = event.translation.height;
                if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
                swipe(dx);
            })}
        >
            <List
                navigationTitle={`${currentIndex + 1} / ${total}`}
                navigationBarTitleDisplayMode="inline"
            >
                <Section title="標題">
                    <Text font={17} bold>
                        {item.title}
                    </Text>
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
                <Section title="操作提示">
                    <HStack>
                        <Image
                            systemName="hand.draw.fill"
                            foregroundStyle={"systemPurple"}
                            frame={{ width: 24 }}
                        />
                        <Text foregroundStyle="secondaryLabel" font={13}>
                            ← 右滑上一篇 / 左滑下一篇 →
                        </Text>
                    </HStack>
                    <HStack>
                        <Button
                            action={() => {
                                if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
                            }}
                            disabled={currentIndex <= 0}>
                            <HStack>
                                <Image systemName="chevron.left" />
                                <Text>上一篇</Text>
                            </HStack>
                        </Button>
                        <Spacer />
                        <Button
                            action={() => {
                                if (currentIndex < total - 1)
                                    setCurrentIndex(currentIndex + 1);
                            }}
                            disabled={currentIndex >= total - 1}>
                            <HStack>
                                <Text>下一篇</Text>
                                <Image systemName="chevron.right" />
                            </HStack>
                        </Button>
                    </HStack>
                </Section>
                <Section title="連結">
                    <Text foregroundStyle="secondaryLabel" font={13} lineLimit={3}>
                        {item.link}
                    </Text>
                </Section>
            </List>
        </VStack>
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

    function openNewsDetail(index: number): void {
        void Navigation.present(
            <NavigationStack>
                <NewsDetailView news={news} initialIndex={index} />
            </NavigationStack>
        );
    }

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
                                <ProgressView
                                    progressViewStyle={"circular"}
                                    padding
                                />
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
                                    <Button
                                        key={`news-${index}`}
                                        action={() => openNewsDetail(index)}
                                        buttonStyle="plain"
                                        frame={{
                                            maxWidth: "infinity",
                                            alignment: "leading",
                                        }}>
                                        <VStack
                                            alignment="leading"
                                            spacing={4}>
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
                                    </Button>
                                ))}
                            </Section>
                        </List>
                    );
                })()}
            </VStack>
        </NavigationStack>
    );
}
