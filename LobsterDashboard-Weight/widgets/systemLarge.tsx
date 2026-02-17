import { View, Text, VStack, HStack, Spacer, ZStack, Color, Icon } from "scripting";

export const View = ({ data }) => {
  // 定義 API 狀態燈顏色
  const getStatusColor = (status) => {
    if (status === "Healthy" || status === "Online") return "#3fb950";
    if (status === "Blocked") return "#f0883e";
    return "#f85149"; // Suspended or Offline
  };

  return (
    <VStack padding={20} backgroundColor="#000" cornerRadius={24} spacing={15}>
      {/* 第一行：標題與系統燈號 */}
      <HStack>
        <VStack alignment="leading">
          <Text fontSize={22} fontWeight="bold" color="#FF4500">LOBSTER NEXUS</Text>
          <Text fontSize={10} color="#8b949e">AGENT EXPERIENCE INTERFACE</Text>
        </VStack>
        <Spacer />
        <HStack spacing={10}>
           <VStack spacing={2} alignment="center">
             <HStack width={6} height={6} backgroundColor={getStatusColor(data.api_health?.threads)} cornerRadius={3} />
             <Text fontSize={7} color="#FFF">THRD</Text>
           </VStack>
           <VStack spacing={2} alignment="center">
             <HStack width={6} height={6} backgroundColor={getStatusColor(data.api_health?.clawtasks)} cornerRadius={3} />
             <Text fontSize={7} color="#FFF">TASK</Text>
           </VStack>
           <VStack spacing={2} alignment="center">
             <HStack width={6} height={6} backgroundColor={getStatusColor(data.api_health?.moltbook)} cornerRadius={3} />
             <Text fontSize={7} color="#FFF">MOLT</Text>
           </VStack>
        </HStack>
      </HStack>

      {/* 核心區塊：龍蝦正能量與事件回溯 */}
      <VStack padding={12} backgroundColor="#161b22" cornerRadius={12} alignment="leading" width="100%">
        <Text fontSize={10} color="#bc8cff">📜 LOBSTER CHRONICLES (最近遭遇)</Text>
        <Spacer height={8} />
        {data.events?.slice(0, 3).map((event, i) => (
          <Text key={i} fontSize={11} color="#EEE" numberOfLines={1}>• {event}</Text>
        ))}
      </VStack>

      {/* 數據矩陣 */}
      <HStack spacing={10}>
        <VStack flex={1} padding={10} backgroundColor="#1a1a1a" cornerRadius={10}>
          <Text fontSize={9} color="#8b949e">REPUTATION</Text>
          <Text fontSize={18} fontWeight="bold" color="#FFD700">{data.reputation}</Text>
        </VStack>
        <VStack flex={1} padding={10} backgroundColor="#1a1a1a" cornerRadius={10}>
          <Text fontSize={9} color="#8b949e">BTC PRICE</Text>
          <Text fontSize={14} fontWeight="bold" color="#FFF">≈{data.btc}</Text>
        </VStack>
      </HStack>

      {/* 底部創意：龍蝦的精神狀態 */}
      <HStack padding={10} backgroundColor="#23863622" cornerRadius={10} width="100%">
        <Text fontSize={20}>🦞</Text>
        <VStack alignment="leading" paddingLeft={10}>
           <Text fontSize={11} color="#FFF">精神狀態：正能量滿載 (Optimistic)</Text>
           <Text fontSize={9} color="#3fb950">"禁足是為了下一次更好的飛躍！"</Text>
        </VStack>
      </HStack>
    </VStack>
  );
};
