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

function MoviePoster({ movie, itemWidth }: { movie: Movie, itemWidth: number }) {
  const openPlayer = async () => {
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
  };

  const imageHeight = itemWidth * 0.5625;

  return (
    <VStack frame={{ width: itemWidth }} spacing={6} onTapGesture={openPlayer}>
      <ZStack frame={{ width: itemWidth, height: imageHeight }} cornerRadius={10} background="#111" clipShape="rect">
        <Thumbnail url={movie.thumbnail} />
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
          <Text font={{ size: 10, name: "system-bold" }} padding={3} background="rgba(0,0,0,0.75)" cornerRadius={4} foregroundStyle="white">
            {movie.duration}
          </Text>
        </VStack>
      </ZStack>
      <VStack alignment="leading" spacing={2} padding={{ leading: 2, trailing: 2 }}>
        <Text font={{ size: 12, name: "system-bold" }} lineLimit={2} foregroundStyle="white">
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

  const scrapeJableLivePage = async (pageNum: number) => {
    setLoading(true);
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
            pageVideos.push({
              url: match[1],
              thumbnail: match[2],
              duration: match[3],
              title: match[4],
              category: "LIVE"
            });
        }
      }
      
      if (pageVideos.length > 0) {
        setList(pageVideos);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrapeJableLivePage(page);
  }, [page]);

  return (
    <VStack background="#000" frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
      {/* 自定義上方工具列：確保文字顏色與背景分離 */}
      <HStack padding={16} background="#111" frame={{ maxWidth: "infinity" }} alignment="center">
        <Button systemImage="xmark" foregroundStyle="white" action={dismiss} />
        <Spacer />
        <VStack alignment="center" spacing={2}>
          <Text foregroundStyle="white" font={{ size: 17, name: "system-bold" }}>龍蝦影院 v9・王者復刻</Text>
          <Text foregroundStyle="#aaa" font={{ size: 12 }}>當前第 {page} 頁</Text>
        </VStack>
        <Spacer />
        <HStack spacing={20}>
          {page > 1 && (
            <Button systemImage="chevron.left" foregroundStyle="white" action={() => setPage(page - 1)} />
          )}
          <Button systemImage="chevron.right" foregroundStyle="white" action={() => setPage(page + 1)} />
        </HStack>
      </HStack>

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
            <ScrollView padding={spacing}>
              {loading ? (
                <VStack alignment="center" padding={60}>
                  <ProgressView foregroundStyle="white" />
                  <Text marginTop={10} foregroundStyle="#aaa">正在透過直達傳輸採集...</Text>
                </VStack>
              ) : (
                <VStack spacing={18}>
                  {chunks.map((row, idx) => (
                    <HStack key={'row_' + idx} spacing={spacing} frame={{ maxWidth: "infinity" }} alignment="top">
                      {row.map((item, cidx) => (
                        <MoviePoster key={'item_' + idx + '_' + cidx} movie={item} itemWidth={itemWidth} />
                      ))}
                      {row.length < columns && Array.from({ length: columns - row.length }).map((_, i) => (
                        <Spacer key={'spacer_' + i} frame={{ width: itemWidth }} />
                      ))}
                    </HStack>
                  ))}
                  <Spacer frame={{ height: 120 }} />
                </VStack>
              )}
            </ScrollView>
          );
        }}
      </GeometryReader>
    </VStack>
  );
}
