import {
  Button,
  HStack,
  Image,
  List,
  Navigation,
  NavigationStack,
  ScrollView,
  Section,
  Spacer,
  Text,
  VStack,
  ZStack,
  fetch,
  useEffect,
  useState,
  Safari,
  ProgressView
} from "scripting";

interface VideoItem {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
}

export function LobsterCinemaPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("點擊重新整理獲取內容");

  const dismiss = Navigation.useDismiss();

  const handleRefresh = async () => {
    setLoading(true);
    setStatusMessage("正在聯網採集... 🛰️");
    try {
      const response = await fetch("https://kanav.ad/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        },
        timeout: 20
      });

      if (!response.ok) throw new Error("網路連線異常");

      const html = await response.text();
      const results: VideoItem[] = [];
      
      // 改進的正則匹配 (配合 Kanav 目前的 HTML 結構)
      const pattern = /<div class="video-item">([\s\S]*?)<\/div>\s*<\/div>/g;
      let match;
      
      while ((match = pattern.exec(html)) !== null) {
        const block = match[1];
        const titleM = block.match(/alt="([^"]+)"/);
        const linkM = block.match(/href="([^"]+)"/);
        const imgM = block.match(/data-original="([^"]+)"/);
        const durM = block.match(/<span class="model-view">([^<]+)<\/span>/);
        const catM = block.match(/<span class="model-view-left">([^<]+)<\/span>/);

        if (titleM && linkM) {
          results.push({
            title: titleM[1],
            url: "https://kanav.ad" + linkM[1],
            thumbnail: imgM ? imgM[1] : "",
            duration: durM ? durM[1].trim() : "未知",
            category: catM ? catM[1].trim() : "推薦"
          });
        }
      }

      setVideos(results);
      setStatusMessage(`更新成功：共 ${results.length} 部影片`);
    } catch (error) {
      console.error(error);
      setStatusMessage("採集失敗，請檢查網路連線");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <NavigationStack>
      <ZStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
        {/* 背景漸層風格 */}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background={"#000000"} />
        
        <ScrollView navigationTitle="龍蝦影院 🍿">
          <VStack spacing={16} padding={16}>
            <HStack alignment="center">
                <VStack alignment="leading">
                    <Text font="headline" foregroundStyle="white">最新推薦</Text>
                    <Text font="caption" foregroundStyle="secondaryLabel">{statusMessage}</Text>
                </VStack>
                <Spacer />
                <Button 
                    action={handleRefresh}
                    systemImage={loading ? "arrow.triangle.2.circlepath" : "arrow.clockwise"}
                    buttonStyle="borderedProminent"
                    foregroundStyle="white"
                />
            </HStack>

            {loading && videos.length === 0 ? (
                <VStack alignment="center" padding={40}>
                    <ProgressView />
                    <Text marginTop={10} foregroundStyle="secondaryLabel">龍蝦正潛入深海採集中...</Text>
                </VStack>
            ) : null}

            {videos.length > 0 ? (
                <VStack spacing={20}>
                    {videos.map((vid, idx) => (
                        <HStack 
                            key={`vid-${idx}`} 
                            spacing={12} 
                            padding={10} 
                            background="rgba(255,255,255,0.05)" 
                            cornerRadius={12}
                            onTapGesture={async () => {
                                await Safari.present(vid.url);
                            }}
                        >
                            <Image 
                                url={vid.thumbnail} 
                                frame={{ width: 120, height: 80 }} 
                                cornerRadius={8}
                                contentMode="cover"
                            />
                            <VStack alignment="leading" spacing={4} frame={{ maxWidth: "infinity" }}>
                                <Text font="subheadline" foregroundStyle="white" lineLimit={2}>{vid.title}</Text>
                                <HStack spacing={8}>
                                    <Text font="caption2" foregroundStyle="secondaryLabel">🕒 {vid.duration}</Text>
                                    <Text font="caption2" foregroundStyle="orange">#{vid.category}</Text>
                                </HStack>
                            </VStack>
                        </HStack>
                    ))}
                </VStack>
            ) : !loading && (
                <Text alignment="center" padding={20} foregroundStyle="secondaryLabel">尚未找到影片數據</Text>
            )}
            
            <Spacer frame={{ height: 60 }} />
          </VStack>
        </ScrollView>
      </ZStack>
    </NavigationStack>
  );
}
