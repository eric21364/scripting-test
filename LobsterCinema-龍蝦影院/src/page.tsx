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
  AVPlayer,
  AVPlayerView,
} from "scripting";

interface VideoItem {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
  m3u8?: string;
}

const DATA_URL = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

// 縮圖子組件：嚴格遵循 UIImage.fromURL 異步加載規範
function ThumbnailImage({ url }: { url: string }) {
  const [image, setImage] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // 官方 v2 規範：UIImage.fromURL 是 Promise 類型
        const img = await UIImage.fromURL(url);
        if (active && img) setImage(img);
      } catch (e) {
        console.log("UIImage.fromURL 載入失敗:", e);
      }
    })();
    return () => { active = false; };
  }, [url]);

  if (!image) return <ProgressView progressViewStyle="circular" />;
  
  return (
    <Image
      image={image}
      resizable
      scaleToFill
      frame={{ maxWidth: "infinity", height: 160 }}
    />
  );
}

export function View() {
  const dismiss = Navigation.useDismiss();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  
  // 初始化官方推薦的 AVPlayer 管理對象
  const [player] = useState(() => new AVPlayer());

  const loadData = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(DATA_URL + "?t=" + Date.now());
      const json = await resp.json();
      if (json.kanav_list) {
        setVideos(json.kanav_list);
      }
    } catch (e) {
      console.error("載入 JSON 失敗:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // 退出畫面時確保播放器停止
    return () => player.pause();
  }, [player]);

  // 分組列表為 2 欄位格形式
  const rows = [];
  for (let i = 0; i < videos.length; i += 2) {
    rows.push(videos.slice(i, i + 2));
  }

  return (
    <NavigationStack>
      <VStack
        navigationTitle={selectedVideo ? "正在影院放映" : "龍蝦豪華影院 🍿"}
        background="#000"
        toolbar={{
          topBarLeading: [
            <Button
              title={selectedVideo ? "返回選片" : "離開"}
              systemImage={selectedVideo ? "chevron.left" : "xmark"}
              action={() => {
                if (selectedVideo) {
                    player.pause();
                    setSelectedVideo(null);
                } else {
                    dismiss();
                }
              }}
            />
          ],
          topBarTrailing: selectedVideo ? [] : [
            <Button 
                title="重新整理" 
                systemImage="arrow.clockwise" 
                action={loadData} 
            />
          ]
        }}
      >
        {selectedVideo ? (
          /* 真・App內播放器 (AVPlayerView) */
          <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="#000">
            <VStack frame={{ maxWidth: "infinity", height: 260 }} background="#111">
                <AVPlayerView
                  player={player}
                  frame={{ maxWidth: "infinity", height: 260 }}
                  onAppear={() => {
                    if (selectedVideo.m3u8) {
                        player.setSource(selectedVideo.m3u8);
                        player.play();
                    }
                  }}
                />
            </VStack>
            
            <VStack padding={20} alignment="leading" spacing={14}>
              <Text font="headline" foregroundStyle="white" bold>{selectedVideo.title}</Text>
              <HStack spacing={12}>
                <Text font="caption" foregroundStyle="orange" bold>#{selectedVideo.category}</Text>
                <Text font="caption" foregroundStyle="secondaryLabel">{selectedVideo.duration}</Text>
              </HStack>
              
              <Spacer frame={{ height: 20 }} />
              
              <Button
                title={player.isPlaying ? "暫停放映" : "魔力播放"}
                systemImage={player.isPlaying ? "pause.fill" : "play.fill"}
                buttonStyle="borderedProminent"
                action={() => {
                  if (player.isPlaying) player.pause();
                  else player.play();
                }}
              />
              
              <Text font="caption2" foregroundStyle="secondaryLabel" marginTop={10}>
                龍蝦提示：若畫面載入較慢，可點選上方「魔力播放」按鈕強行重啟。
              </Text>
            </VStack>
          </VStack>
        ) : (
          /* 海報牆模式 */
          <ScrollView padding={12}>
            {isLoading && videos.length === 0 ? (
                 <VStack alignment="center" padding={40}>
                    <ProgressView />
                    <Text marginTop={10} foregroundStyle="secondaryLabel">影院同步中...</Text>
                 </VStack>
            ) : (
                <VStack spacing={18}>
                    {rows.map((row, rowIdx) => (
                        <HStack key={rowIdx} spacing={12} frame={{ maxWidth: "infinity" }}>
                            {row.map((vid, colIdx) => (
                                <VStack
                                    key={colIdx}
                                    spacing={8}
                                    frame={{ maxWidth: "infinity" }}
                                    onTapGesture={() => setSelectedVideo(vid)}
                                >
                                    <ZStack frame={{ maxWidth: "infinity", height: 160 }} cornerRadius={12} background="rgba(255,255,255,0.05)" clipShape="rect">
                                        <ThumbnailImage url={vid.thumbnail} />
                                        
                                        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
                                            <Text font={{ size: 9, name: "system-bold" }} padding={4} background="rgba(0,0,0,0.7)" cornerRadius={4} foregroundStyle="white">
                                                {vid.duration}
                                            </Text>
                                        </VStack>
                                        <Image systemName="play.circle.fill" font={30} foregroundStyle="rgba(255,255,255,0.6)" />
                                    </ZStack>
                                    
                                    <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity" }}>
                                        <Text font={{ size: 12, name: "system-medium" }} lineLimit={2} foregroundStyle="white">
                                            {vid.title}
                                        </Text>
                                        <Text font={{ size: 10 }} foregroundStyle="orange">#{vid.category}</Text>
                                    </VStack>
                                </VStack>
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
