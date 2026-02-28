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
  WebViewController,
} from "scripting";

interface VideoItem {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
}

const DATA_URL = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

function MovieCard({ video }: { video: VideoItem }) {
  const [thumb, setThumb] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // 使用 2.4.5 官方推薦的 Promise 加載方式
        const image = await UIImage.fromURL(video.thumbnail);
        if (active && image) setThumb(image);
      } catch (e) {
        console.log("UIImage 載入錯誤:", e);
      }
    })();
    return () => { active = false; };
  }, [video.thumbnail]);

  const handlePlay = async () => {
    try {
      const controller = new WebViewController();
      
      // 預加載網址
      await controller.loadURL(video.url);
      
      // 注入 CSS 腳本，優化觀影體驗（隱藏導航與廣告）
      const css = `
        header, footer, .sidebar, .nav-main, .home-featured, .category-count, .m-footer, .header-mobile, #LowerRightAd, #dialog-kanav {
            display: none !important;
        }
        body, .main {
            background: black !important;
            margin: 0 !important;
            padding: 0 !important;
        }
      `;
      const js = `
        const style = document.createElement('style');
        style.innerHTML = \`${css}\`;
        document.head.appendChild(style);
      `;
      
      await controller.evaluateJavaScript(js);
      
      // 依照文檔使用 present 呼叫原生 WebView 控制器
      await controller.present({ 
        fullscreen: true, 
        navigationTitle: video.title 
      });

    } catch (e) {
      console.log("播放器啟動失敗:", e);
    }
  };

  return (
    <VStack
      frame={{ maxWidth: "infinity" }}
      spacing={8}
      onTapGesture={handlePlay}
    >
      <ZStack frame={{ maxWidth: "infinity", height: 120 }} cornerRadius={12} background="rgba(255,255,255,0.08)" clipShape="rect">
        {thumb ? (
          <Image
            image={thumb}
            resizable
            scaleToFill
            frame={{ maxWidth: "infinity", height: 120 }}
          />
        ) : (
          <ProgressView />
        )}
        
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
          <Text 
            font={{ size: 9, name: "system-bold" }} 
            padding={{ horizontal: 5, vertical: 2 }}
            background="rgba(0,0,0,0.7)" 
            cornerRadius={4}
            foregroundStyle="white"
          >
            {video.duration}
          </Text>
        </VStack>
        <Image systemName="play.fill" font={20} foregroundStyle="rgba(255,255,255,0.6)" />
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

export function View() {
  const dismiss = Navigation.useDismiss();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(DATA_URL + "?t=" + Date.now());
      const json = await resp.json();
      if (json.kanav_list) {
        setVideos(json.kanav_list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chunks = [];
  for (let i = 0; i < videos.length; i += 2) {
    chunks.push(videos.slice(i, i + 2));
  }

  return (
    <NavigationStack>
      <VStack
        navigationTitle="龍蝦影院 🍿"
        background="#000"
        toolbar={{
          topBarLeading: [
            <Button
              title="離開"
              systemImage="xmark"
              action={dismiss}
            />,
          ],
          topBarTrailing: [
            <Button
              title="重新整理"
              systemImage="arrow.clockwise"
              action={loadData}
            />,
          ],
        }}
      >
        <ScrollView padding={12}>
          {isLoading && videos.length === 0 ? (
            <VStack alignment="center" padding={60}>
              <ProgressView />
              <Text marginTop={10} foregroundStyle="secondaryLabel">正在同步熱門清單...</Text>
            </VStack>
          ) : (
            <VStack spacing={20}>
              {chunks.map((row, ridx) => (
                <HStack key={ridx} spacing={12} frame={{ maxWidth: "infinity" }}>
                  {row.map((item, cidx) => (
                    <MovieCard key={cidx} video={item} />
                  ))}
                  {row.length === 1 && <Spacer frame={{ maxWidth: "infinity" }} />}
                </HStack>
              ))}
              <Spacer frame={{ height: 60 }} />
            </VStack>
          )}
        </ScrollView>
      </VStack>
    </NavigationStack>
  );
}
