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
  GeometryReader,
} from "scripting";

interface Movie {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
}

// 🛡️ 龍蝦物理全域鎖定
let LOBSTER_GLOBAL_PLAYER_LOCK = false;

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
      frame={{ maxWidth: "infinity", height: "infinity" }}
    />
  );
}

function MoviePoster({ movie, itemWidth, globalLoadingId, setGlobalLoadingId }: { 
    movie: Movie, 
    itemWidth: number,
    globalLoadingId: string | null,
    setGlobalLoadingId: (id: string | null) => void 
}) {
  const movieId = movie.url;
  const isThisOpening = globalLoadingId === movieId;

  const openPlayer = async () => {
    if (LOBSTER_GLOBAL_PLAYER_LOCK) return;
    
    LOBSTER_GLOBAL_PLAYER_LOCK = true;
    setGlobalLoadingId(movieId);

    try {
      const resp = await fetch(movie.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' }
      });
      const html = await resp.text();
      const match = html.match(/hlsUrl\s*=\s*['"]([^'"]+\.m3u8)['"]/);

      if (match && match[1]) {
        const m3u8 = match[1];
        const player = new WebViewController();
        await player.loadURL(m3u8);
        await player.present({ fullscreen: true, navigationTitle: movie.title });
        LOBSTER_GLOBAL_PLAYER_LOCK = false;
        setGlobalLoadingId(null);
        return;
      }
    } catch (e) {}

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
    
    LOBSTER_GLOBAL_PLAYER_LOCK = false;
    setGlobalLoadingId(null);
  };

  const imageHeight = itemWidth * 0.5625;

  return (
    <VStack frame={{ width: itemWidth }} spacing={6} onTapGesture={openPlayer}>
      <ZStack frame={{ width: itemWidth, height: imageHeight }} cornerRadius={10} background="secondarySystemBackground" clipShape="rect">
        <Thumbnail url={movie.thumbnail} />
        {isThisOpening && (
          <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center" background="rgba(0,0,0,0.5)">
            <ProgressView />
          </VStack>
        )}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
          <Text font={{ size: 10, name: "system-bold" }} padding={3} background="rgba(0,0,0,0.75)" cornerRadius={4} foregroundStyle="white">
            {movie.duration}
          </Text>
        </VStack>
      </ZStack>
      <VStack alignment="leading" spacing={2} padding={{ leading: 2, trailing: 2 }}>
        <Text font={{ size: 12, name: "system-bold" }} lineLimit={2} opacity={(LOBSTER_GLOBAL_PLAYER_LOCK && !isThisOpening) ? 0.3 : 1}>
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
  const [page, setPage] = useState(1);
  const [globalLoadingId, setGlobalLoadingId] = useState<string | null>(null);

  const scrapeJableLivePage = async (pageNum: number) => {
    setLoading(true);
    setList([]);
    try {
      const startFrom = (pageNum - 1) * 24;
      const pageUrl = `https://jable.tv/hot/?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=post_date&from=${startFrom}&_=${Date.now()}`;
      const resp = await fetch(pageUrl, {
        headers: { 
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest'
        }
      });
      const html = await resp.text();
      const cardRegex = /<div class="video-img-box[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img[^>]*?data-src="([^"]+)"[^>]*?>[\s\S]*?<span class="label">([^<]+)<\/span>[\s\S]*?<(?:div|h6) class="title">[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
      const pageVideos: Movie[] = [];
      let match;
      while ((match = cardRegex.exec(html)) !== null) {
        if (match[2] && !match[2].includes('placeholder')) {
            pageVideos.push({ url: match[1], thumbnail: match[2], duration: match[3], title: match[4], category: "LIVE" });
        }
      }
      setList(pageVideos);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrapeJableLivePage(page);
    LOBSTER_GLOBAL_PLAYER_LOCK = false;
    setGlobalLoadingId(null);
  }, [page]);

  const handleNext = () => {
    if (!LOBSTER_GLOBAL_PLAYER_LOCK) setPage(p => p + 1);
  };

  const handlePrev = () => {
    if (!LOBSTER_GLOBAL_PLAYER_LOCK) setPage(p => Math.max(1, p - 1));
  };

  return (
    <NavigationStack>
      <GeometryReader>
        {(proxy) => {
          const minItemWidth = 160;
          const spacing = 12;
          const columns = Math.max(2, Math.floor((proxy.size.width - spacing) / (minItemWidth + spacing)));
          const totalSpacing = spacing * (columns + 1);
          const itemWidth = (proxy.size.width - totalSpacing) / columns;

          const chunks = [];
          for (let i = 0; i < list.length; i += columns) {
            chunks.push(list.slice(i, i + columns));
          }

          return (
            <VStack
              navigationTitle={`龍蝦 v9・智慧分頁 (P.${page})`}
              // 🖐️ 手勢感應核心：向左滑翻下一頁，向右滑翻上一頁
              onSwipeGesture={(direction) => {
                  if (direction === "left") handleNext();
                  if (direction === "right") handlePrev();
              }}
              toolbar={{
                topBarLeading: [<Button systemImage="xmark" action={dismiss} />],
                topBarTrailing: [
                  <HStack spacing={15}>
                    <Button systemImage="chevron.left" action={handlePrev} />
                    <Button systemImage="chevron.right" action={handleNext} />
                  </HStack>
                ]
              }}
            >
              <ScrollView padding={spacing}>
                {loading && list.length === 0 ? (
                  <VStack alignment="center" padding={60}>
                    <ProgressView />
                    <Text marginTop={10} foregroundStyle="secondaryLabel">正在採集第 {page} 頁...</Text>
                  </VStack>
                ) : (
                  <VStack spacing={18}>
                    {chunks.map((row, idx) => (
                      <HStack key={'row_' + idx} spacing={spacing} frame={{ maxWidth: "infinity" }} alignment="top">
                        {row.map((item, cidx) => (
                          <MoviePoster 
                            key={'item_p' + page + '_' + idx + '_' + cidx} 
                            movie={item} 
                            itemWidth={itemWidth} 
                            globalLoadingId={globalLoadingId}
                            setGlobalLoadingId={setGlobalLoadingId}
                          />
                        ))}
                        {row.length < columns && Array.from({ length: columns - row.length }).map((_, i) => (
                          <Spacer key={'spacer_' + i} frame={{ width: itemWidth }} />
                        ))}
                      </HStack>
                    ))}
                    {list.length > 0 && (
                        <VStack alignment="center" padding={20}>
                            <HStack spacing={30}>
                                <Button title="上一頁" action={handlePrev} disabled={page === 1} />
                                <Text foregroundStyle="secondaryLabel">第 {page} 頁</Text>
                                <Button title="下一頁" action={handleNext} />
                            </HStack>
                            <Text marginTop={10} font={{ size: 10 }} foregroundStyle="quaternaryLabel">提示：可左右滑動頁面進行手勢翻頁</Text>
                        </VStack>
                    )}
                    <Spacer frame={{ height: 120 }} />
                  </VStack>
                )}
              </ScrollView>
            </VStack>
          );
        }}
      </GeometryReader>
    </NavigationStack>
  );
}
