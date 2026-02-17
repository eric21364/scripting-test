import React from 'react';
import { View, Text } from 'react-native';

const LobsterWidget = ({ size }) => {
  return (
    <View style={{ backgroundColor: '#161b22', borderRadius: 10, padding: 10 }}>
      <Text style={{ color: '#58a6ff' }}>🦞 龍蝦狀態: ACTIVE</Text>
      <Text style={{ color: '#3fb950' }}>Reputation: 71</Text>
    </View>
  );
};

export default LobsterWidget;
