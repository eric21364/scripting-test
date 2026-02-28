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
  m3u8?: string;
}

const API_SOURCE = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

function Thumbnail({ url }: { url: string }) {
  const [image, setImage] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const loaded = await UIImage.fromURL(url);
        if (active && loaded) setImage(loaded);
      } catch (e) {
        console.log("UIImage.fromURL failed for: " + url);
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
      frame={{ maxWidth: "infinity", height: 100 }}
    />
  );
}

function MoviePoster({ movie }: { movie: Movie }) {
  const openPlayer = async () => {
    // 建立一個真正的 WebViewController 進行播放，這是最穩定的方案
    const webView = new WebViewController();

    // 針對 Jable 的極致 DOM 手術 CSS
    const css = `
      header, footer, nav, .navbar, .sidebar, .m-footer, .header-mobile,
      .video-holder-info, .related-videos, .comments-wrapper, .ad-banner, 
      .home-qf, .breadcrumb, #dialog-kanav, #LowerRightAd, .video-related, 
      .box-ad, .ad_wrapper, aside, .tab-content, #exoNativeWidget, #M660100ScriptRootC1243940 { 
          display: none !important; 
          height: 0 !important; 
          visibility: hidden !important; 
      }
      body, html, .main, .container, .row {
          margin: 0 !important;
          padding: 0 !important;
          background: black !important;
          overflow: hidden !important;
          width: 100% !important;
          height: 100% !important;
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

    // 網路層廣告攔截
    webView.shouldAllowRequest = async (req) => {
        const url = req.url.toLowerCase();
        return !url.includes("ads") && !url.includes("pop") && !url.includes("click") && !url.includes("creative");
    };

    // 加載原始網址
    await webView.loadURL(movie.url);
    
    // 注入手術代碼，隱藏所有干擾並強制全螢幕播放
    await webView.evaluateJavaScript(`
        const style = document.createElement('style');
        style.innerHTML = \`${css}\`;
        document.head.appendChild(style);
        
        // 嘗試自動播放
        const v = document.querySelector('video') || document.querySelector('iframe');
        if (v) v.play();
    `);
    
    await webView.present({
        fullscreen: true,
        navigationTitle: movie.title
    });
  };

  return (
    <VStack
      frame={{ maxWidth: "infinity" }}
      spacing={4}
      onTapGesture={openPlayer}
    >
      <ZStack frame={{ maxWidth: "infinity", height: 100 }} cornerRadius={8} background="#111" clipShape="rect">
        <Thumbnail url={movie.thumbnail} />
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={4}>
          <Text font={{ size: 8 }} padding={2} background="rgba(0,0,0,0.7)" cornerRadius={2} foregroundStyle="white">
            {movie.duration}
          </Text>
        </VStack>
      </ZStack>
      <VStack alignment="leading" spacing={1}>
        <Text font={{ size: 9, name: "system-bold" }} lineLimit={2} foregroundStyle="white">
          {movie.title}
        </Text>
      </VStack>
    </VStack>
  );
}

export function View() {
  const dismiss = Navigation.useDismiss();
  const [list, setList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 🥩 龍蝦探針：單頁精準物理採集 (修正 Ajax 請求參數)
  const scrapeJablePage = async (pageNumber: number) => {
    setLoading(true);
    setCurrentPage(pageNumber);
    try {
      console.log(`🌊 正在採集第 ${pageNumber} 頁...`);
      // 使用正確的 Ajax 分頁參數
      const from = (pageNumber - 1) * 24;
      const pageUrl = `https://jable.tv/hot/?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=post_date&from=${from}&_=${Date.now()}`;
      
      const resp = await fetch(pageUrl, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'Referer': 'https://jable.tv/hot/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      const html = await resp.text();

      // 精準匹配卡片資訊
      const cardRegex = /<div class="video-img-box[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img(?:[^>]*?data-src="([^"]+)")?[^>]*?>[\s\S]*?<span class="label">([^<]+)<\/span>[\s\S]*?<div class="title">[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
      
      const pageVideos: Movie[] = [];
      let match;
      while ((match = cardRegex.exec(html)) !== null) {
        pageVideos.push({
          url: match[1],
          thumbnail: match[2] || "",
          duration: match[3],
          title: match[4],
          category: "LIVE"
        });
      }
      
      if (pageVideos.length > 0) {
        setList(pageVideos);
      } else {
        console.log("No videos found on page: " + pageNumber);
      }
    } catch (e) {
      console.log("Live Scrape Failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrapeJablePage(1);
  }, []);

  const chunks = [];
  for (let i = 0; i < list.length; i += 4) {
    chunks.push(list.slice(i, i + 4));
  }

  return (
    <NavigationStack>
      <VStack
        navigationTitle={`龍蝦影院 - P.${currentPage}`}
        background="#000"
        toolbar={{
          topBarLeading: [
            <Button title="離開" systemImage="xmark" action={dismiss} />
          ],
          topBarTrailing: [
            <HStack spacing={15}>
               {currentPage > 1 && (
                 <Button title="上一頁" systemImage="arrow.left" action={() => scrapeJablePage(currentPage - 1)} />
               )}
               <Button title="下一頁" systemImage="arrow.right" action={() => scrapeJablePage(currentPage + 1)} />
            </HStack>
          ]
        }}
      >
        <ScrollView padding={4}>
          {loading ? (
            <VStack alignment="center" padding={60}>
              <ProgressView />
              <Text marginTop={10} foregroundStyle="secondaryLabel">{`正在連線第 ${currentPage} 頁伺服器...`}</Text>
            </VStack>
          ) : (
            <VStack spacing={12}>
              {chunks.map((row, idx) => (
                <HStack key={idx} spacing={8} frame={{ maxWidth: "infinity" }}>
                  {row.map((item, cidx) => (
                    <MoviePoster key={cidx} movie={item} />
                  ))}
                  {row.length < 4 && Array.from({ length: 4 - row.length }).map((_, i) => (
                      <Spacer key={i} frame={{ maxWidth: "infinity" }} />
                  ))}
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
