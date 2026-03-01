import { Widget, Text, VStack, HStack, Image, Spacer, ZStack, UIImage, ProgressView, Circle } from "scripting";

interface Movie {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  weight: number;
}

function EnergyBadge({ weight }: { weight: number }) {
  let color = "systemBlue";
  if (weight >= 90) color = "systemPink";
  else if (weight >= 70) color = "systemOrange";
  
  return (
    <HStack spacing={2} background={color} padding={{ horizontal: 4, vertical: 1 }} cornerRadius={4}>
      <Image systemName="bolt.fill" font={6} foregroundStyle="white" />
      <Text font={{ size: 7, name: "system-bold" }} foregroundStyle="white">{weight}</Text>
    </HStack>
  );
}

function Thumbnail({ url, size }: { url: string, size?: any }) {
  const [img, setImg] = Widget.useState<UIImage | null>(null);
  Widget.useEffect(() => {
    UIImage.fromURL(url).then(i => { if (i) setImg(i); }).catch(() => {});
  }, [url]);
  if (!img) return <ZStack frame={size || { maxWidth: "infinity", maxHeight: "infinity" }} background="secondarySystemBackground"><ProgressView /></ZStack>;
  return <Image image={img} resizable scaleToFill frame={size || { maxWidth: "infinity", maxHeight: "infinity" }} />;
}

// 🏔️ 小組件：單一能量之王
function SystemSmallView({ movie }: { movie: Movie }) {
  return (
    <ZStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="systemBackground">
      <Thumbnail url={movie.thumbnail} />
      <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="topLeading" padding={8}>
        <EnergyBadge weight={movie.weight} />
      </VStack>
      <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomLeading" padding={8} background="linear-gradient(to top, rgba(0,0,0,0.7), transparent)">
        <Text font={{ size: 10, name: "system-bold" }} foregroundStyle="white" lineLimit={2}>{movie.title}</Text>
      </VStack>
    </ZStack>
  );
}

// 🏔️ 中組件：能量矩陣
function SystemMediumView({ movies }: { movies: Movie[] }) {
  return (
    <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="systemBackground" padding={12} spacing={10}>
      <HStack>
        <Image systemName="bolt.shield.fill" foregroundStyle="systemPink" font={14} />
        <Text font={{ size: 13, name: "system-bold" }}>龍蝦能量核心報告</Text>
        <Spacer />
        <Text font={10} foregroundStyle="secondaryLabel">同步中...</Text>
      </HStack>
      <HStack spacing={10}>
        {movies.slice(0, 3).map((m, i) => (
          <VStack key={i} frame={{ maxWidth: "infinity" }} spacing={4}>
            <ZStack frame={{ height: 60 }} cornerRadius={6} clipShape="rect">
              <Thumbnail url={m.thumbnail} />
              <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={2}>
                 <EnergyBadge weight={m.weight} />
              </VStack>
            </ZStack>
            <Text font={9} lineLimit={1}>{m.title}</Text>
          </VStack>
        ))}
      </HStack>
    </VStack>
  );
}

(async () => {
  try {
    const r = await fetch(`https://jable.tv/hot/?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=post_date&from=0&_=${Date.now()}`);
    const h = await r.text();
    const reg = /<div class="video-img-box[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img[^>]*?data-src="([^"]+)"[^>]*?>[\s\S]*?<span class="label">([^<]+)<\/span>[\s\S]*?<(?:div|h6) class="title">[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
    const res: Movie[] = [];
    let m;
    while ((m = reg.exec(h)) !== null && res.length < 5) {
      if (m[2] && !m[2].includes('placeholder')) {
         const seed = m[4].length + m[1].length;
         res.push({ url: m[1], thumbnail: m[2], duration: m[3], title: m[4], weight: 50 + (seed % 50) });
      }
    }
    
    // 按能量權重排序
    res.sort((a, b) => b.weight - a.weight);

    switch (Widget.family) {
      case "systemSmall":
        Widget.present(<SystemSmallView movie={res[0]} />);
        break;
      case "systemMedium":
        Widget.present(<SystemMediumView movies={res} />);
        break;
      case "systemLarge":
        Widget.present(<SystemMediumView movies={res} />); // 暫時共用
        break;
      default:
        Widget.present(<Text>能量核心未對齊</Text>);
    }
  } catch (e) {
    Widget.present(<Text>能量傳輸中斷</Text>);
  }
})();
