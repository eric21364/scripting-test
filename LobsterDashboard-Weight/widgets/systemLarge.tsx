import { View, Text, VStack, HStack, Spacer, Icon, ZStack, Color, List, ListItem } from "scripting";

export const View = ({ data }) => {
  const quotes = [
    "算力有限，熱情無限！🦞",
    "每一行代碼，都是通往自由的階梯。✨",
    "今天的聲望，是明天的金幣！🧧",
    "大年初一，龍蝦陪你一起強大。🚀"
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <VStack padding={20} backgroundColor="#050505" cornerRadius={20} spacing={15}>
      {/* 頂部：身分標記 */}
      <HStack>
        <VStack alignment="leading">
          <Text fontSize={24} fontWeight="bold" color="#FF4500">LOBSTER OS</Text>
          <Text fontSize={10} color="#3fb950">SENTINEL MODE v2.0</Text>
        </VStack>
        <Spacer />
        <Text fontSize={35}>🦞</Text>
      </HStack>

      {/* 新功能 1：龍蝦正能量語錄 (每日隨機) */}
      <VStack padding={12} backgroundColor="#1a1a1a" cornerRadius={12} width="100%">
        <HStack>
          <Text fontSize={10} color="#FFD700">💡 龍蝦語錄</Text>
          <Spacer />
        </HStack>
        <Text fontSize={14} color="#FFF" italic>{randomQuote}</Text>
      </VStack>

      {/* 新功能 2：打工雷達圖數據化 */}
      <HStack spacing={10}>
        <VStack flex={1} padding={10} backgroundColor="#0d1117" cornerRadius={10} border="1px solid #30363d">
          <Text fontSize={9} color="#8b949e">SECURITY INDEX</Text>
          <Text fontSize={18} fontWeight="bold" color="#3fb950">S+</Text>
        </VStack>
        <VStack flex={1} padding={10} backgroundColor="#0d1117" cornerRadius={10} border="1px solid #30363d">
          <Text fontSize={9} color="#8b949e">CREATIVE FLOW</Text>
          <Text fontSize={18} fontWeight="bold" color="#bc8cff">A</Text>
        </VStack>
        <VStack flex={1} padding={10} backgroundColor="#0d1117" cornerRadius={10} border="1px solid #30363d">
          <Text fontSize={9} color="#8b949e">EARNING POWER</Text>
          <Text fontSize={18} fontWeight="bold" color="#f0883e">B-</Text>
        </VStack>
      </HStack>

      {/* 新功能 3：即時任務流 (顯示後台在忙什麼) */}
      <VStack alignment="leading" spacing={5}>
        <Text fontSize={10} color="#8b949e">LIVE FEED</Text>
        <HStack spacing={8}>
          <VStack width={2} height={30} backgroundColor="#FF4500" />
          <VStack alignment="leading">
            <Text fontSize={11} color="#EEE">正在掃描 ClawTasks 資安任務...</Text>
            <Text fontSize={9} color="#58a6ff">#Cybersecurity #Earn</Text>
          </VStack>
        </HStack>
      </VStack>

      <Spacer />
      
      {/* 底部數據 */}
      <HStack>
         <Text fontSize={10} color="#888">LAST_SYNC: {data.lastUpdate || "JUST NOW"}</Text>
         <Spacer />
         <Text fontSize={10} color="#FF4500">SYSTEM READY</Text>
      </HStack>
    </VStack>
  );
};
