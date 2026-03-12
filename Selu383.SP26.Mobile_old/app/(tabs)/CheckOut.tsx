import React, {useState} from 'react';
import {Text, ImageBackground, View, Image, ScrollView, TextInput, Button, FlatList, StyleSheet, SectionList} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';


type Cat2Props = {
	name: string;
};



const image = {uri: 'C:\Users\ikill\cmps383-2026-sp-p03-cmps383-2026-sp-p03-g03\Selu383.SP26.Mobile\app\(tabs)\johnnysekka.jpg'};

const Cafe1 = () => {
	return (
		<>
		
		<SafeAreaProvider>
			<SafeAreaView style={styles.container} edges={['left', 'right']}>
			  <ImageBackground source={require('./johnnysekka.jpg')} resizeMode="cover" style={styles.image}>
				<Text style={styles.text}>ORDER COMPLETED</Text>
			  </ImageBackground>
			</SafeAreaView>
		</SafeAreaProvider>
		

		</>
	)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    color: 'color="#65a30d"',
    fontSize: 42,
    lineHeight: 84,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#65a30d',
  },
});



export default Cafe1;