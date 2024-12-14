import React from 'react';
import { SafeAreaView, StyleSheet, Vibration, View } from 'react-native';
import DogList from './src/DogList';


function App(){
  return(
    <SafeAreaView style={{flex:1}}>
      <View style={{flex:1}}>
        <DogList/>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
});

export default App;
