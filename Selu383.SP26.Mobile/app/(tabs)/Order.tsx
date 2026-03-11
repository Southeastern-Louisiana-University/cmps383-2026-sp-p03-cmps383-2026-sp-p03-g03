import React, {useState} from 'react';
import {Text, ImageBackground, View, Image, ScrollView, TextInput, Button, FlatList, StyleSheet, SectionList} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';


type Cat2Props = {
	name: string;
};

const Cat2 = (props: Cat2Props) => {
	const [isHungry, setIsHungry] = useState(true);
	return(
		<View>
			<Text>
				I am {props.name}, am I am {isHungry ? 'hungry' : 'full'}!
			</Text>
			<Button
				onPress={() => {
						setIsHungry(false);
				}}
				disabled={!isHungry}
				title={isHungry ? 'Give me food, please!' : 'Danke schon'}
			/>
			
		</View>
	);
};

const image = {uri: 'C:\Users\ikill\cmps383-2026-sp-p03-cmps383-2026-sp-p03-g03\Selu383.SP26.Mobile\app\(tabs)\johnnysekka.jpg'};

const Cafe1 = () => {
	return (
		<>
		
		<SafeAreaProvider>
			<SafeAreaView style={styles.container} edges={['left', 'right']}>
			  <ImageBackground source={image} resizeMode="cover" style={styles.image}>
				<Text style={styles.text}>Inside</Text>
			  </ImageBackground>
			</SafeAreaView>
		</SafeAreaProvider>
		
			<Cat2 name="Lucy"/>
			<Cat2 name="Piep"/>
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
    color: 'white',
    fontSize: 42,
    lineHeight: 84,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#000000c0',
  },
});



export default Cafe1;