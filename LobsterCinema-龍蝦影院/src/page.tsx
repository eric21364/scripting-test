import {
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
  DragGesture,
  Circle,
  TextField,
  RoundedRectangle
} from "scripting";

interface Movie {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
  weight: number; // 👈 龍蝦能量權重
}

// 🛡️ 播放鎖定單例
let PLAY_LOCK = false;

function CircleIconButton({ icon, action, size = 32, iconSize = 16, fill = "rgba(0,0,0,0.06)", foregroundStyle = "label", disabled = false }: any) {
  return (
    <Button action={action} buttonStyle="plain" disabled={disabled}>
      <ZStack frame={{ width: size, height: size }}>
        <Circle fill={fill} />
        <Image systemName={icon} font={iconSize} foregroundStyle={foregroundStyle} />
      </ZStack>
    </Button>
  )
}

// 🎇 龍蝦能量核徽章 (Weight Badge)
function EnergyBadge({ weight }: { weight: number }) {
  let color = "systemBlue";
  if (weight >= 90) color = "systemPink";
  else if (weight >= 70) color = "systemOrange";
  
  return (
    <HStack spacing={2} background={color} padding={{ horizontal: 5, vertical: 2 }} cornerRadius={5} shadow={{ color: color, radius: 4 }}>
      <Image systemName="bolt.fill" font={8} foregroundStyle="white" />
      <Text font={{ size: 8, name: "system-bold" }} foregroundStyle="white">{weight}</Text>
    </HStack>
  );
}

function Thumbnail({ url }: { url: string }) {
  const [img, setImg] = useState<UIImage | null>(null);
  useEffect(() => {
    let active = true;
    UIImage.fromURL(url).then(i => { if (i && active) setImg(i); }).catch(() => {});
    return () => { active = false; };
  }, [url]);
  if (!img) return <ProgressView progressViewStyle="circular" />;
  return <Image image={img} resizable scaleToFill frame={{ maxWidth: "infinity", height: "infinity" }} />;
}

function MoviePoster({ movie, itemWidth, loadingUid, setloadingUid }: any) {
  const isL = loadingUid === movie.url;
  const tap = async () => {
    if (PLAY_LOCK) return;
    PLAY_LOCK = true;
    setloadingUid(movie.url);
    const t = setTimeout(() => { PLAY_LOCK = false; setloadingUid(null); }, 15000);
    try {
      const resp = await fetch(movie.url);
      const html = await resp.text();
      const match = html.match(/hlsUrl\s*=\s*['"]([^'"]+\.m3u8)['"]/);
      const ctrl = new WebViewController();
      await ctrl.loadURL(match && match[1] ? match[1] : movie.url);
      await ctrl.present({ fullscreen: true, navigationTitle: movie.title });
    } catch (e) {} finally { clearTimeout(t); PLAY_LOCK = false; setloadingUid(null); }
  };

  return (
    <VStack frame={{ width: itemWidth }} spacing={6} onTapGesture={tap}>
      <ZStack frame={{ width: itemWidth, height: itemWidth * 0.56 }} cornerRadius={10} background="secondarySystemBackground" clipShape="rect">
        <Thumbnail url={movie.thumbnail} />
        {isL && <ProgressView />}
        
        {/* 🎇 能量核位置 */}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="topLeading" padding={4}>
           <EnergyBadge weight={movie.weight} />
        </VStack>

        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={4}>
           <Text font={{size: 9, name: "system-bold"}} background="rgba(0,0,0,0.6)" padding={2} cornerRadius={4} foregroundStyle="white">{movie.duration}</Text>
        </VStack>
      </ZStack>
      <Text font={{size: 11, name: "system-bold"}} lineLimit={2} opacity={PLAY_LOCK && !isL ? 0.35 : 1}>{movie.title}</Text>
    </VStack>
  );
}

export function View() {
  const dismiss = Navigation.useDismiss();
  const [list, setList] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingUid, setloadingUid] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const fetcher = async (p: number, query: string) => {
    setLoading(true);
    setList([]);
    try {
      const blockId = query ? "list_videos_videos_list_search_result" : "list_videos_common_videos_list";
      const baseUrl = query ? `https://jable.tv/search/${encodeURIComponent(query)}/${p}/` : "https://jable.tv/hot/";
      const fromOffset = (p - 1) * 24;
      const targetUrl = `${baseUrl}?mode=async&function=get_block&block_id=${blockId}&from=${fromOffset}&_=${Date.now()}`;
      
      const r = await fetch(targetUrl, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      const h = await r.text();
      
      const reg = /<div class="video-img-box[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img[^>]*?data-src="([^"]+)"[^>]*?>[\s\S]*?<span class="label">([^<]+)<\/span>[\s\S]*?<(?:div|h6) class="title">[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
      const res: Movie[] = [];
      let m;
      while ((m = reg.exec(h)) !== null) {
        if (m[2] && !m[2].includes('placeholder')) {
           // 🎰 龍蝦能量核物理模擬（基於時序與餘數）
           const seed = m[4].length + m[1].length;
           const simulatedWeight = 50 + (seed % 50); 
           res.push({ 
             url: m[1], 
             thumbnail: m[2], 
             duration: m[3], 
             title: m[4], 
             category: "",
             weight: simulatedWeight
           });
        }
      }
      setList(res);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetcher(page, activeSearch); PLAY_LOCK = false; }, [page, activeSearch]);

  const goNext = () => setPage(p => p + 1);
  const goPrev = () => setPage(p => Math.max(1, p - 1));
  const triggerSearch = () => { if (keyword.trim() === activeSearch) return; setPage(1); setActiveSearch(keyword.trim()); };
  const clearSearch = () => { setKeyword(""); setActiveSearch(""); setPage(1); };

  return (
    <VStack spacing={0} background="systemBackground" frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
        
        {/* 🏔️ Header */}
        <VStack spacing={0} background="systemBackground" zIndex={100}>
          <HStack padding={{ top: 8, leading: 16, trailing: 16, bottom: 4 }} alignment="center">
            <CircleIconButton icon="xmark" action={dismiss} />
            <Spacer />
            <VStack alignment="center">
              <Text font={{ size: 16, name: "system-bold" }}>龍蝦影院 v9.9.9</Text>
              <Text font={{ size: 9 }} foregroundStyle="secondaryLabel">{activeSearch ? `能量搜尋：${activeSearch}` : "中心熱門"} · P.{page}</Text>
            </VStack>
            <Spacer />
            <HStack spacing={12}>
              <CircleIconButton icon="chevron.left" action={goPrev} disabled={page === 1} foregroundStyle={page === 1 ? "tertiaryLabel" : "label"} />
              <CircleIconButton icon="chevron.right" action={goNext} />
            </HStack>
          </HStack>
          
          <HStack spacing={8} padding={{ leading: 16, trailing: 16, bottom: 10 }} alignment="center">
            <HStack frame={{ maxWidth: "infinity" }} padding={{ horizontal: 10, vertical: 6 }} background="secondarySystemBackground" cornerRadius={10}>
              <Image systemName="magnifyingglass" font={14} foregroundStyle="secondaryLabel" />
              <TextField title="" prompt="探查目標關鍵字..." value={keyword} onChanged={setKeyword} onSubmit={triggerSearch} frame={{ maxWidth: "infinity" }} textFieldStyle="plain" />
              {keyword.length > 0 && (
                <Button action={clearSearch} buttonStyle="plain">
                  <Image systemName="xmark.circle.fill" font={14} foregroundStyle="tertiaryLabel" />
                </Button>
              )}
            </HStack>
          </HStack>
          <VStack frame={{ height: 0.5, maxWidth: "infinity" }} background="separator" />
        </VStack>

        <GeometryReader>
          {(proxy) => {
            const columns = proxy.size.width > 600 ? 4 : 2;
            const space = 12;
            const itemWidth = (proxy.size.width - space * (columns + 1)) / columns;
            const chunks = [];
            for (let i = 0; i < list.length; i += columns) chunks.push(list.slice(i, i + columns));

            return (
              <ZStack
                frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
                simultaneousGesture={DragGesture({ minDistance: 50 }).onEnded(e => {
                  if (Math.abs(e.translation.width) > 100 && Math.abs(e.translation.width) > Math.abs(e.translation.height)) {
                    if (e.translation.width < 0) goNext(); else goPrev();
                  }
                })}
              >
                <ScrollView padding={space}>
                  {loading && list.length === 0 ? (
                    <VStack alignment="center" padding={60}><ProgressView /></VStack>
                  ) : list.length === 0 ? (
                    <VStack alignment="center" padding={60} spacing={10}><Image systemName="bolt.slash" font={40} foregroundStyle="quaternaryLabel" /><Text foregroundStyle="secondaryLabel">能量源消失，請嘗試其他關鍵字</Text></VStack>
                  ) : (
                    <VStack spacing={18}>
                      {chunks.map((row, i) => (
                        <HStack key={`p${page}r${i}`} spacing={space} alignment="top">
                          {row.map(m => (
                            <MoviePoster key={m.url} movie={m} itemWidth={itemWidth} loadingUid={loadingUid} setloadingUid={setloadingUid} />
                          ))}
                          {row.length < columns && Array.from({ length: columns - row.length }).map((_, si) => (
                            <Spacer key={si} frame={{ width: itemWidth }} />
                          ))}
                        </HStack>
                      ))}
                      <Spacer frame={{ height: 40 }} />
                    </VStack>
                  )}
                </ScrollView>
              </ZStack>
            );
          }}
        </GeometryReader>
    </VStack>
  );
}
