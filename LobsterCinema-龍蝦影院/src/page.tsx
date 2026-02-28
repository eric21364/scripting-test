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
        const loaded = await UIImage.fromURL(url);
        if (active && loaded) setImage(loaded);
      } catch (e) {}
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
    <VStack frame={{ maxWidth: "infinity" }} spacing={4} onTapGesture={openPlayer}>
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
  // list 用來存放目前「分頁」顯示的資料
  const [list, setList] = useState<Movie[]>([]);
  // allCache 用來存放「全攻堅」抓回來的原始數據
  const [allCache, setAllCache] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 24;

  // 🥩 v9.0 物理全打核心
  const scrapeEverything = async () => {
    setLoading(true);
    let collected: Movie[] = [];
    try {
      console.log("🌊 正在執行 v9.0 物理全掃描 (1-10 頁)...");
      
      for (let p = 1; p <= 10; p++) {
        const from = (p - 1) * 24;
        const pageUrl = `https://jable.tv/hot/?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=post_date&from=${from}&_=${Date.now()}`;
        
        try {
          const resp = await fetch(pageUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }
          });
          const html = await resp.text();
          // v9.0 的靈魂正則
          const cardRegex = /<div class="video-img-box[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img(?:[^>]*?data-src="([^"]+)")?[^>]*?>[\s\S]*?<span class="label">([^<]+)<\/span>[\s\S]*?<div class="title">[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
          
          let m;
          while ((m = cardRegex.exec(html)) !== null) {
            collected.push({ url: m[1], thumbnail: m[2] || "", duration: m[3], title: m[4], category: "LIVE" });
          }
        } catch (e) {}
      }
      
      if (collected.length > 0) {
        setAllCache(collected);
        // 初始載入第一頁
        setList(collected.slice(0, pageSize));
      }
    } catch (err) {
      console.log("Mass Scrape Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 當頁碼改變時，從 allCache 切割數據到 list（物理同步顯示）
  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = page * pageSize;
    if (allCache.length > 0) {
      setList(allCache.slice(start, end));
    }
  }, [page, allCache]);

  useEffect(() => {
    scrapeEverything();
  }, []);

  const chunks = [];
  for (let i = 0; i < list.length; i += 4) {
    chunks.push(list.slice(i, i + 4));
  }

  const totalPages = Math.ceil(allCache.length / pageSize) || 1;

  return (
    <NavigationStack>
      <VStack
        navigationTitle={`龍蝦 v19 (P.${page}/${totalPages})`}
        background="#000"
        toolbar={{
          topBarLeading: [
            <Button title="離開" systemImage="xmark" action={dismiss} />
          ],
          topBarTrailing: [
            <HStack spacing={15}>
               {page > 1 && (
                 <Button title="上頁" systemImage="chevron.left" action={() => setPage(p => p - 1)} />
               )}
               {page < totalPages && (
                 <Button title="下頁" systemImage="chevron.right" action={() => setPage(p => p + 1)} />
               )}
               <Button title="重刷" systemImage="antenna.radiowave.left.and.right" action={scrapeEverything} />
            </HStack>
          ]
        }}
      >
        <ScrollView padding={4}>
          {loading && allCache.length === 0 ? (
            <VStack alignment="center" padding={60}>
              <ProgressView />
              <Text marginTop={10} foregroundStyle="secondaryLabel">正在復刻 v9.0 王者探針中...</Text>
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
