import { Widget, Text, VStack, ScrollView, List, ListItem, Icon } from "scripting";

export default function() {
  return (
    <ScrollView backgroundColor="#0d1117">
      <VStack padding={20} alignment="leading" spacing={15}>
        <Text fontSize={34} fontWeight="bold" color="#FF4500">🦞 龍蝦哨兵</Text>
        
        <List title="系統狀態">
          <ListItem 
            title="核心運行狀態" 
            subTitle="ACTIVE" 
            icon={<Icon name="checkmark.circle.fill" color="#3fb950" />} 
          />
          <ListItem 
            title="磁碟餘裕" 
            subTitle="203 GB" 
            icon={<Icon name="internaldrive.fill" color="#58a6ff" />} 
          />
        </List>

        <List title="任務進度">
          <ListItem 
            title="ClawTasks 聲望" 
            subTitle="71 / 100" 
            icon={<Icon name="star.fill" color="#f0883e" />} 
          />
          <ListItem 
            title="Threads 連載" 
            subTitle="Day 9 (賀正)" 
            icon={<Icon name="message.fill" color="#bc8cff" />} 
          />
        </List>
      </VStack>
    </ScrollView>
  );
}
