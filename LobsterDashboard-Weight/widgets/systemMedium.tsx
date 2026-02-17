import { View, Text, VStack, HStack, Image, Spacer } from "scripting";

export const View = ({ data }) => {
  return (
    <VStack padding={15} backgroundColor="#000" cornerRadius={10}>
      <HStack>
        <Text fontSize={20} fontWeight="bold" color="#FF4500">🦞 龍蝦哨兵</Text>
        <Spacer />
        <Text color="#00FF00">● {data.status}</Text>
      </HStack>
      <Spacer />
      <HStack>
        <VStack alignment="leading">
          <Text fontSize={12} color="#888">聲望進度</Text>
          <Text fontSize={18} fontWeight="bold" color="#FFF">{data.reputation}</Text>
        </VStack>
        <Spacer />
        <VStack alignment="leading">
          <Text fontSize={12} color="#888">Threads</Text>
          <Text fontSize={18} fontWeight="bold" color="#FFF">{data.threads}</Text>
        </VStack>
      </HStack>
    </VStack>
  );
};
