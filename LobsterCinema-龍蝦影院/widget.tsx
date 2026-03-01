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
    <HStack spacing={2} background={color} padding={{ horizontal: 5, vertical: 2 }} cornerRadius={5}>
      <Image systemName="bolt.fill" font={7} foregroundStyle="white" />
      <Text font={{ size: 8, name: "system-bold" }} foregroundStyle="white">{weight}</Text>
    </HStack>
  );
}

// 🏔️ 強化版組件縮圖渲染器
function WidgetThumbnail({ url, frame }: { url: string, frame?: any }) {
  const [img, setImg] = Widget.useState<UIImage | null>(null);
  
  Widget.useEffect(() => {
    // 🛡️ 龍蝦物理採集：確保 URL 完整
    const cleanUrl = url.startsWith('http') ? url : `https:${url}`;
    UIImage.fromURL(cleanUrl).then(i => { 
      if (i) setImg(i); 
    }).catch(() => {});
  }, [url]);

  if (!img) return (
    <ZStack frame={frame || { maxWidth: "infinity", maxHeight: "infinity" }} background="secondarySystemBackground">
      <ProgressView />
    </ZStack>
  );
  
  return (
    <Image 
      image={img} 
      resizable 
      scaleToFill 
      frame={frame || { maxWidth: "infinity", maxHeight: "infinity" }} 
    />
  );
}

// 🏔️ 小組件：龍蝦隨機海報 (Random Poster)
function SystemSmallView({ movie }: { movie: Movie }) {
  return (
    <ZStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="black">
      <WidgetThumbnail url={movie.thumbnail} />
      
      {/* 🔮 漸層遮罩增強文字辨識度 */}
      <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="linear-gradient(to top, rgba(0,0,0,0.9), transparent 70%)" />
      
      <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="topLeading" padding={8}>
        <EnergyBadge weight={movie.weight} />
      </VStack>
      
      <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomLeading" padding={10} spacing={2}>
        <Text font={{ size: 10, name: "system-bold" }} foregroundStyle="white" lineLimit={2}>{movie.title}</Text>
        <HStack spacing={4}>
           <Image systemName="clock" font={8} foregroundStyle="secondaryLabel" />
           <Text font={8} foregroundStyle="secondaryLabel">{movie.duration}</Text>
        </HStack>
      </VStack>
    </ZStack>
  );
}

// 🏔️ 中組件：龍蝦焦點劇照 (Featured Focus)
function SystemMediumView({ movie }: { movie: Movie }) {
  return (
    <HStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="systemBackground" spacing={0}>
      <WidgetThumbnail url={movie.thumbnail} frame={{ width: "60%", height: "infinity" }} />
      
      <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} padding={12} alignment="leading">
        <HStack>
           <Image systemName="lobster.fill" foregroundStyle="systemPink" font={12} />
           <Text font={{ size: 10, name: "system-bold" }} foregroundStyle="secondaryLabel">今日潛探</Text>
        </HStack>
        
        <Spacer frame={{ height: 8 }} />
        
        <Text font={{ size: 12, name: "system-bold" }} lineLimit={3}>{movie.title}</Text>
        
        <Spacer />
        
        <VStack alignment="leading" spacing={6}>
          <HStack spacing={4}>
            <Image systemName="bolt.heart.fill" foregroundStyle="systemOrange" font={10} />
            <Text font={9} foregroundStyle="secondaryLabel">戰力：{movie.weight}</Text>
          </HStack>
          <EnergyBadge weight={movie.weight} />
        </VStack>
      </VStack>
    </HStack>
  );
}

(async () => {
  try {
    const r = await fetch(`https://jable.tv/hot/?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=post_date&from=0&_=${Date.now()}`);
    const h = await r.text();
    // 🛡️ 強化正則：更精準鎖定圖片與標題
    const reg = /<div class="video-img-box[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img[^>]*?data-src="([^"]+)"[^>]*?>[\s\S]*?<span class="label">([^<]+)<\/span>[\s\S]*?<(?:div|h6) class="title">[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
    const res: Movie[] = [];
    let m;
    while ((m = reg.exec(h)) !== null) {
      const thumb = m[2];
      const title = m[4];
      if (thumb && !thumb.includes('placeholder')) {
         const seed = title.length + m[1].length;
         res.push({ url: m[1], thumbnail: thumb, duration: m[3], title: title, weight: 50 + (seed % 50) });
      }
    }
    
    if (res.length === 0) throw new Error("No Data");
    
    // 🎲 隨機性標校
    const featuredMovie = res[Math.floor(Math.random() * res.length)];

    switch (Widget.family) {
      case "systemSmall":
        Widget.present(<SystemSmallView movie={featuredMovie} />);
        break;
      case "systemMedium":
        Widget.present(<SystemMediumView movie={featuredMovie} />);
        break;
      case "systemLarge":
        Widget.present(<SystemMediumView movie={featuredMovie} />); 
        break;
      default:
        Widget.present(<Text>核心未對齊</Text>);
    }
  } catch (e) {
    Widget.present(<VStack alignment="center" spacing={10}><Image systemName="antenna.radiowaves.left.and.right.slash" font={24} foregroundStyle="secondaryLabel" /><Text font={12}>深海通訊重試中...</Text></VStack>);
  }
})();
