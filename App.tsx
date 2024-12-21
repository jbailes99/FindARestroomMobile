import React from 'react';
import { View, Image, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './src/screens/Home';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="GottaGo"
          screenOptions={{
            // You can place global options for all screens here
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={require('./src/assets/idk.png')} // Your logo here
                  style={{ width: 30, height: 30 }}
                />
                <Text style={{ fontSize: 24, marginLeft: 8 }}>GottaGo</Text>
              </View>
            ),
            headerStyle: {
              backgroundColor: '#f8f8f8', // Set header background color
            },
            headerTintColor: '#333', // Set color of header text
            headerTitleStyle: {
              fontWeight: 'bold', // Make title bold
            },
          }}
        >
          <Stack.Screen
            name="sdf"
            component={HomeScreen} // Your home screen component
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
