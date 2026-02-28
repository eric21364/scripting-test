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

function Thumbnail({ url }: { url: string }) {
  const [image, setImage] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // 遵循官方 Utilities/UIImage 文檔
        const loaded = await UIImage.fromURL(url);
        if (active && loaded) setImage(loaded);
      } catch (e) {
        console.log("UIImage.fromURL failed");
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

function MoviePoster({ movie }: { movie: Movie }) {
  const openPlayer = async () => {
    try {
      // 嘗試直接透過手機端 fetch 抓取原始碼
      const resp = await fetch(movie.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }
      });
      const html = await resp.text();
      // 修正後的正則表達式，確保能精準捕捉 m3u8
      const match = html.match(/hlsUrl\s*=\s*['"]([^'"]+\.m3u8)['"]/);

      if (match && match[1]) {
        const m3u8 = match[1];
        const player = new WebViewController();
        // 直接加載 m3u8，iOS 會啟動原生的 AVPlayer 進行播放，這是最乾淨的體驗
        await player.loadURL(m3u8);
        await player.present({
          fullscreen: true,
          navigationTitle: movie.title
        });
        return;
      }
    } catch (e) {
      console.log("M3U8 Fast-Fetch failed:", e);
    }

    // 若 API / fetch 失敗，則退回原本的 DOM 手術模式 (帶有廣告攔截功能)
    runFallbackSurgery();
  };

  const runFallbackSurgery = async () => {
    const webView = new WebViewController();
    const css = `
      header, footer, nav, .navbar, .sidebar, .m-footer, .header-mobile,
      .video-holder-info, .related-videos, .comments-wrapper, .ad-banner, 
      .home-qf, .breadcrumb, #dialog-kanav, #LowerRightAd, .video-related, 
      .box-ad, .ad_wrapper, aside, .tab-content, #exoNativeWidget, #M660100ScriptRootC1243940 { 
          display: none !important; 
          height: 0 !important; 
          visibility: hidden !important; 
      }
      body, .main, .container, .row {
          margin: 0 !important;
          padding: 0 !important;
          background: black !important;
          overflow: hidden !important;
      }
      #player, video, #dplayer {
          width: 100vw !important;
          height: 56.25vw !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 99999 !important;
      }
    `;

    webView.shouldAllowRequest = async (req) => {
        const url = req.url.toLowerCase();
        return !url.includes("ads") && !url.includes("pop") && !url.includes("click");
    };

    await webView.loadURL(movie.url);
    await webView.evaluateJavaScript(`
        const style = document.createElement('style');
        style.innerHTML = \`${css}\`;
        document.head.appendChild(style);
    `);
    
    await webView.present({
        fullscreen: true,
        navigationTitle: movie.title
    });
  };

  return (
    <VStack
      frame={{ maxWidth: "infinity" }}
      spacing={8}
      onTapGesture={openPlayer}
    >
      <ZStack frame={{ maxWidth: "infinity", height: 160 }} cornerRadius={12} background="#111" clipShape="rect">
        <Thumbnail url={movie.thumbnail} />
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
          <Text font={{ size: 10 }} padding={3} background="rgba(0,0,0,0.7)" cornerRadius={4} foregroundStyle="white">
            {movie.duration}
          </Text>
        </VStack>
        <Image systemName="play.circle.fill" font={30} foregroundStyle="rgba(255,255,255,0.6)" />
      </ZStack>
      <VStack alignment="leading" spacing={2}>
        <Text font={{ size: 12, name: "system-bold" }} lineLimit={2} foregroundStyle="white">
          {movie.title}
        </Text>
        <Text font="caption2" foregroundStyle="orange" bold>#JABLE</Text>
      </VStack>
    </VStack>
  );
}

export function View() {
  const dismiss = Navigation.useDismiss();
  const [list, setList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const resp = await fetch(API_SOURCE + "?t=" + Date.now());
      const res = await resp.json();
      if (res.kanav_list) setList(res.kanav_list);
    } catch (e) {
      console.log("Refresh Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const chunks = [];
  for (let i = 0; i < list.length; i += 2) {
    chunks.push(list.slice(i, i + 2));
  }

  return (
    <NavigationStack>
      <VStack
        navigationTitle="龍蝦影院 v7.0"
        background="#000"
        toolbar={{
          // 修正按鈕組合：頂部 Leading 負責離開，Trailing 負責刷新
          topBarLeading: [
            <Button title="離開" systemImage="xmark" action={dismiss} />
          ],
          topBarTrailing: [
            <Button title="同步" systemImage="arrow.clockwise" action={refresh} />
          ]
        }}
      >
        <ScrollView padding={12}>
          {loading && list.length === 0 ? (
            <VStack alignment="center" padding={60}>
              <ProgressView />
              <Text marginTop={10} foregroundStyle="secondaryLabel">正在部署純淨影視通道...</Text>
            </VStack>
          ) : (
            <VStack spacing={20}>
              {chunks.map((row, idx) => (
                <HStack key={idx} spacing={12} frame={{ maxWidth: "infinity" }}>
                  {row.map((item, cidx) => (
                    <MoviePoster key={cidx} movie={item} />
                  ))}
                  {row.length === 1 && <Spacer frame={{ maxWidth: "infinity" }} />}
                </HStack>
              ))}
              <Spacer frame={{ height: 100 }} />
            </VStack>
          )}
        </ScrollView>
      </VStack>
    </NavigationStack>
  );
}
