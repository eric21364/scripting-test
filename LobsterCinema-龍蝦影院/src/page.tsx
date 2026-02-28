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

interface Movie {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
}

const API_SOURCE = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

/**
 * 高清縮圖組件：解決預加載與顯示問題
 */
function PosterThumbnail({ url }: { url: string }) {
  const [image, setImage] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // 遵循官方 v2.4.5: UIImage.fromURL 返回 Promise<UIImage | null>
        const loaded = await UIImage.fromURL(url);
        if (active && loaded) setImage(loaded);
      } catch (e) {
        console.log("Image pre-load error:", url);
      }
    })();
    return () => { active = false; };
  }, [url]);

  if (!image) {
    return (
      <VStack frame={{ maxWidth: "infinity", height: 130 }} alignment="center" background="rgba(255,255,255,0.08)">
        <ProgressView />
      </VStack>
    );
  }

  return (
    <Image
      image={image}
      resizable
      scaleToFill
      frame={{ maxWidth: "infinity", height: 130 }}
    />
  );
}

/**
 * 海報卡片：執行 WebViewController 沉浸模式
 */
function MovieCard({ movie }: { movie: Movie }) {
  const playVideo = async () => {
    // 初始化官方 WebViewController
    const webView = new WebViewController();

    // 1. 網路層過濾廣告
    webView.shouldAllowRequest = async (request) => {
      const blocked = ["ads", "pop", "analytics", "doubleclick", "adservice"];
      return !blocked.some(k => request.url.toLowerCase().includes(k));
    };

    // 2. 載入網址
    await webView.loadURL(movie.url);

    // 3. 視圖呈現
    void webView.present({ fullscreen: true, navigationTitle: movie.title });

    // 4. 等待加載完成後執行「元素切除手術」
    await webView.waitForLoad();
    
    // JS 注入：隱藏 Jable/Kanav 的雜訊 UI，僅保留播放器部分
    const domSurgeryJS = `
      (function() {
        const style = document.createElement('style');
        style.innerHTML = \`
          /* 隱藏 header, footer, 側邊欄, 評論區, 推薦列表 */
          header, footer, nav, .navbar, .sidebar, .m-footer, .header-mobile,
          .video-holder-info, .related-videos, .comments-wrapper, .comment-section,
          .ad-banner, .home-qf, .breadcrumb, #dialog-kanav, #LowerRightAd,
          #site-header, #site-footer, .video-related, .box-ad, .ad_wrapper,
          #footer, aside, .tab-content
          { display: none !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important; }

          /* 強制播放容器佔滿螢幕寬度，移除間距 */
          body, .main, .container, .row {
            margin: 0 !important;
            padding: 0 !important;
            background: black !important;
            width: 100vw !important;
            max-width: 100vw !important;
          }

          /* 鎖定播放器位置 */
          #player, .video-holder, .player-wrapper, video, #dplayer {
            width: 100vw !important;
            max-height: 100vh !important;
            position: relative !important;
            top: 0 !important;
            z-index: 99999 !important;
          }
        \`;
        document.head.appendChild(style);
      })();
    `;
    await webView.evaluateJavaScript(domSurgeryJS);
  };

  return (
    <VStack
      frame={{ maxWidth: "infinity" }}
      spacing={6}
      onTapGesture={playVideo}
    >
      <ZStack frame={{ maxWidth: "infinity", height: 130 }} cornerRadius={12} background="#1A1A1A" clipShape="rect">
        <PosterThumbnail url={movie.thumbnail} />
        
        {/* 時長預覽 */}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
          <Text font={{ size: 9 }} padding={3} background="rgba(0,0,0,0.75)" cornerRadius={4} foregroundStyle="white">
            {movie.duration}
          </Text>
        </VStack>
        <Image systemName="play.circle.fill" font={28} foregroundStyle="rgba(255,255,255,0.4)" />
      </ZStack>
      
      <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity" }}>
        <Text font={{ size: 12, name: "system-bold" }} lineLimit={2} foregroundStyle="white">
          {movie.title}
        </Text>
        <Text font="caption2" foregroundStyle="orange" bold>
          #{movie.category}
        </Text>
      </VStack>
    </VStack>
  );
}

/**
 * 龍蝦影院主畫面
 */
export function View() {
  const dismiss = Navigation.useDismiss();
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(API_SOURCE + "?t=" + Date.now());
      const raw = await res.json();
      if (raw.kanav_list) setMovieList(raw.kanav_list);
    } catch (e) {
      console.log("Fetch movie data failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const videoGroups = [];
  for (let i = 0; i < movieList.length; i += 2) {
    videoGroups.push(movieList.slice(i, i + 2));
  }

  return (
    <NavigationStack>
      <VStack
        navigationTitle="龍蝦豪華影院 v6.1"
        background="#000"
        toolbar={{
          cancellationAction: (
            <Button title="返回" systemImage="xmark" action={dismiss} />
          ),
          topBarTrailing: [
            <Button title="重整清單" systemImage="arrow.clockwise" action={fetchData} />
          ],
        }}
      >
        <ScrollView padding={12}>
          {isRefreshing && movieList.length === 0 ? (
            <VStack alignment="center" padding={60}>
              <ProgressView />
              <Text marginTop={10} foregroundStyle="secondaryLabel">正在部署純淨影視通道...</Text>
            </VStack>
          ) : (
            <VStack spacing={20}>
              {videoGroups.map((row, idx) => (
                <HStack key={`row-${idx}`} spacing={10} frame={{ maxWidth: "infinity" }}>
                  {row.map((item, cidx) => (
                    <MovieCard key={`col-${cidx}`} movie={item} />
                  ))}
                  {row.length === 1 && <Spacer frame={{ maxWidth: "infinity" }} />}
                </HStack>
              ))}
              <Spacer frame={{ height: 80 }} />
            </VStack>
          )}
        </ScrollView>
      </VStack>
    </NavigationStack>
  );
}
