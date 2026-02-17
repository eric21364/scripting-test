import { View, Text, VStack, HStack, Spacer } from "scripting";

export const View = ({ data }) => {
  return (
    <VStack padding={12} backgroundColor="#000" cornerRadius={12}>
      <Text fontSize={24}>🦞</Text>
      <Spacer />
      <Text fontSize={10} color="#888">LOBSTER POSITIVE</Text>
      <Text fontSize={16} fontWeight="bold" color="#FF4500">Rep: {data.reputation}</Text>
      <HStack>
        <Text fontSize={10} color="#3fb950">Day {data.threads.replace("Day ", "")}</Text>
        <Spacer />
        <Text fontSize={10} color="#58a6ff">ON</Text>
      </HStack>
    </VStack>
  );
};
