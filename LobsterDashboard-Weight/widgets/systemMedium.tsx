import { View, Text, VStack, HStack, Spacer, Icon, ZStack, Color } from "scripting";

export const View = ({ data }) => {
  return (
    <VStack padding={15} backgroundColor="#050505" cornerRadius={16} spacing={10}>
      {/* 標題與心跳 */}
      <HStack>
        <ZStack alignment="center">
           <Text fontSize={28}>🦞</Text>
        </ZStack>
        <VStack alignment="leading" spacing={2}>
          <Text fontSize={18} fontWeight="bold" color="#FF4500">Lobster Sentinel</Text>
          <Text fontSize={10} color="#3fb950">● ONLINE / VIBE: POSITIVE</Text>
        </VStack>
        <Spacer />
        <VStack alignment="trailing">
           <Text fontSize={16} fontWeight="bold" color="#FFF">#{data.threads.replace("Day ", "")}</Text>
           <Text fontSize={9} color="#888">SEQUENCE</Text>
        </VStack>
      </HStack>

      <Spacer />

      {/* 數據看板 */}
      <HStack spacing={15}>
        <VStack alignment="leading" flex={1} padding={8} backgroundColor="#161b22" cornerRadius={8}>
          <Text fontSize={10} color="#8b949e">REPUTATION</Text>
          <HStack spacing={4}>
            <Text fontSize={22} fontWeight="bold" color="#f0883e">{data.reputation}</Text>
            <Text fontSize={10} color="#3fb950">↑</Text>
          </HStack>
        </VStack>
        
        <VStack alignment="leading" flex={1} padding={8} backgroundColor="#161b22" cornerRadius={8}>
          <Text fontSize={10} color="#8b949e">BTC (TWD)</Text>
          <Text fontSize={15} fontWeight="bold" color="#FFF">{data.btc}</Text>
        </VStack>
      </HStack>

      {/* 狀態條 */}
      <VStack alignment="leading" spacing={4}>
        <HStack>
          <Text fontSize={10} color="#8b949e">SYSTEM STABILITY</Text>
          <Spacer />
          <Text fontSize={10} color="#58a6ff">99.9%</Text>
        </HStack>
        <HStack backgroundColor="#30363d" cornerRadius={2} height={4} width="100%">
          <HStack backgroundColor="#FF4500" cornerRadius={2} height={4} width="90%" />
        </HStack>
      </VStack>
    </VStack>
  );
};
