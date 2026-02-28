import {
  NavigationStack,
  Image,
  Text,
  ScrollView,
  HStack,
  VStack,
  Navigation,
  Spacer,
  Button,
  useState,
  useEffect,
  ProgressView,
  ZStack,
  UIImage,
  Web,
} from "scripting";

interface VideoItem {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
}

// 數據來源：專案內的 status.json (已被後端腳本填充)
const DATA_URL = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

/**
 * 縮圖組件：優化 UIImage 異步加載
 */
function Thumbnail({ url }: { url: string }) {
  const [img, setImg] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const loaded = await UIImage.fromURL(url);
        if (active && loaded) setImg(loaded);
      } catch (e) {
        console.log("UIImage 加載失敗:", url);
      }
    })();
    return () => { active = false; };
  }, [url]);

  if (!img) {
    return (
      <VStack frame={{ maxWidth: "infinity", height: 120 }} alignment="center" background="rgba(255,255,255,0.05)">
        <ProgressView progressViewStyle="circular" />
      </VStack>
    );
  }

  return (
    <Image
      image={img}
      resizable
      scaleToFill
      frame={{ maxWidth: "infinity", height: 120 }}
    />
  );
}

/**
 * 海報卡片組件
 */
function MovieCard({ video, onSelect }: { video: VideoItem; onSelect: (v: VideoItem) => void }) {
  return (
    <VStack
      frame={{ maxWidth: "infinity" }}
      spacing={8}
      onTapGesture={() => onSelect(video)}
    >
      <ZStack frame={{ maxWidth: "infinity", height: 120 }} cornerRadius={10} background="#111" clipShape="rect">
        <Thumbnail url={video.thumbnail} />
        
        {/* 右下角時長 */}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
          <Text font={{ size: 9 }} padding={3} background="rgba(0,0,0,0.7)" cornerRadius={4} foregroundStyle="white">
            {video.duration}
          </Text>
        </VStack>
      </ZStack>
      
      <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity" }}>
        <Text font={{ size: 13, name: "system-bold" }} lineLimit={2} foregroundStyle="white">
          {video.title}
        </Text>
        <Text font="caption2" foregroundStyle="orange">
          #{video.category}
        </Text>
      </VStack>
    </VStack>
  );
}

/**
 * 主頁面
 */
export function View() {
  const dismiss = Navigation.useDismiss();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(DATA_URL + "?t=" + Date.now());
      const data = await resp.json();
      if (data.kanav_list) {
        setVideos(data.kanav_list);
      }
    } catch (e) {
      console.log("數據同步失敗:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // JS 注入：隱藏 Kanav 站點多餘的 UI，僅呈現播放器
  const cleanUpPlayerJS = `
    const style = document.createElement('style');
    style.innerHTML = 'header, footer, .sidebar, .home-qf, .category-count, .m-footer, #LowerRightAd, .vod-title, .dmrules { display: none !important; } .container { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; } #player_play { height: 75vw !important; } body { background: black !important; }';
    document.head.appendChild(style);
  `;

  // 手動切分 2 欄位格
  const rows = [];
  for (let i = 0; i < videos.length; i += 2) {
    rows.push(videos.slice(i, i + 2));
  }

  return (
    <NavigationStack>
      <VStack
        navigationTitle={selectedVideo ? "龍蝦影院 · 正在播放" : "龍蝦影院 🍿"}
        background="#000"
        toolbar={{
          topBarLeading: [
            <Button
              title={selectedVideo ? "返回" : "離開"}
              systemImage={selectedVideo ? "chevron.left" : "xmark"}
              action={() => {
                if (selectedVideo) setSelectedVideo(null);
                else dismiss();
              }}
            />,
          ],
          topBarTrailing: selectedVideo ? [] : [
            <Button 
                title="重整" 
                systemImage="arrow.clockwise" 
                action={fetchData} 
            />
          ]
        }}
      >
        {selectedVideo ? (
          /* 播放模式：使用 Web 組件內置播放 */
          <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
            <Web 
                url={selectedVideo.url} 
                frame={{ maxWidth: "infinity", height: 300 }}
                injectedJavaScript={cleanUpPlayerJS}
            />
            <ScrollView padding={16}>
                <VStack alignment="leading" spacing={12}>
                    <Text font="headline" foregroundStyle="white" bold>{selectedVideo.title}</Text>
                    <HStack spacing={10}>
                        <Text font="caption" foregroundStyle="orange">#{selectedVideo.category}</Text>
                        <Text font="caption" foregroundStyle="secondaryLabel">{selectedVideo.duration}</Text>
                    </HStack>
                    <Spacer frame={{ height: 20 }} />
                    <Text font="body" foregroundStyle="secondaryLabel">
                        龍蝦提示：已成功在 App 內加載沉浸式播放器。連假期間，請慢用。
                    </Text>
                </VStack>
            </ScrollView>
          </VStack>
        ) : (
          /* 海報牆模式 */
          <ScrollView padding={12}>
            {isLoading && videos.length === 0 ? (
                 <VStack alignment="center" padding={40}>
                    <ProgressView />
                    <Text marginTop={10} foregroundStyle="secondaryLabel">正在部署海報牆...</Text>
                 </VStack>
            ) : (
                <VStack spacing={20}>
                    {rows.map((row, rowIdx) => (
                        <HStack key={rowIdx} spacing={12} frame={{ maxWidth: "infinity" }}>
                            {row.map((vid, colIdx) => (
                                <MovieCard key={colIdx} video={vid} onSelect={setSelectedVideo} />
                            ))}
                            {row.length === 1 && <Spacer frame={{ maxWidth: "infinity" }} />}
                        </HStack>
                    ))}
                    <Spacer frame={{ height: 60 }} />
                </VStack>
            )}
          </ScrollView>
        )}
      </VStack>
    </NavigationStack>
  );
}
