import React, { useState, useEffect } from 'react';

// 龍蝦影院 主介面
const LobsterCinemaPage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('準備就緒 🦞');

    const scrapeKanav = async () => {
        setLoading(true);
        setStatus('正在連線至 Kanav... 📡');
        try {
            const resp = await Network.get('https://kanav.ad/', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
                }
            });
            const html = resp.data;
            
            const results = [];
            // 使用強化的正則匹配影片卡片
            const pattern = /<div class="video-item">([\s\S]*?)<\/div>\s*<\/div>/g;
            let match;
            
            while ((match = pattern.exec(html)) !== null) {
                const block = match[1];
                const titleMatch = block.match(/alt="([^"]+)"/);
                const linkMatch = block.match(/href="([^"]+)"/);
                const imgMatch = block.match(/data-original="([^"]+)"/);
                const durationMatch = block.match(/<span class="model-view">([^<]+)<\/span>/);
                const catMatch = block.match(/<span class="model-view-left">([^<]+)<\/span>/);

                if (titleMatch && linkMatch) {
                    results.push({
                        title: titleMatch[1],
                        url: 'https://kanav.ad' + linkMatch[1],
                        thumbnail: imgMatch ? imgMatch[1] : '',
                        duration: durationMatch ? durationMatch[1].trim() : '',
                        category: catMatch ? catMatch[1].trim() : 'Video'
                    });
                }
            }
            
            setVideos(results);
            setStatus(`成功獲取 ${results.length} 部影片! ✨`);
        } catch (err) {
            setStatus(`連線失敗: ${err.message} ❌`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        scrapeKanav();
    }, []);

    return (
        <VStack spacing={0} style={{ backgroundColor: '#121212', flex: 1 }}>
            {/* Header */}
            <HStack padding={16} alignment="center" style={{ backgroundColor: '#1a1a1a', borderBottomWidth: 1, borderColor: '#333' }}>
                <VStack flex={1}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4d' }}>龍蝦影院 🍿</Text>
                    <Text style={{ fontSize: 12, color: '#888' }}>{status}</Text>
                </VStack>
                <Button 
                    onPress={scrapeKanav}
                    loading={loading}
                    style={{ backgroundColor: '#333', padding: 8, borderRadius: 20 }}
                >
                    <Icon name="arrow.clockwise" size={18} color="#fff" />
                </Button>
            </HStack>

            {/* Video Grid */}
            <Scroll flex={1} padding={12}>
                {videos.length === 0 && !loading ? (
                    <Center padding={40}>
                        <Text style={{ color: '#666' }}>暫無影片，請點擊重整。</Text>
                    </Center>
                ) : (
                    <Grid columns={2} spacing={12}>
                        {videos.map((vid, idx) => (
                            <VStack 
                                key={idx} 
                                spacing={8}
                                onPress={() => Router.openBrowser(vid.url)}
                                style={{ backgroundColor: '#1e1e1e', borderRadius: 12, overflow: 'hidden', paddingBottom: 10 }}
                            >
                                <Box style={{ position: 'relative', height: 110 }}>
                                    <Image 
                                        url={vid.thumbnail} 
                                        style={{ width: '100%', height: '100%' }}
                                        contentMode="cover"
                                    />
                                    <Box style={{ 
                                        position: 'absolute', 
                                        bottom: 5, 
                                        right: 5, 
                                        backgroundColor: 'rgba(0,0,0,0.7)', 
                                        padding: 2, 
                                        borderRadius: 4 
                                    }}>
                                        <Text style={{ fontSize: 10, color: '#fff' }}>{vid.duration}</Text>
                                    </Box>
                                </Box>
                                <VStack paddingHorizontal={8}>
                                    <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: 'medium', color: '#eee' }}>{vid.title}</Text>
                                    <Text style={{ fontSize: 11, color: '#ff4d4d', marginTop: 4 }}>#{vid.category}</Text>
                                </VStack>
                            </VStack>
                        ))}
                    </Grid>
                )}
                <Box height={40} />
            </Scroll>
        </VStack>
    );
};

export default LobsterCinemaPage;
