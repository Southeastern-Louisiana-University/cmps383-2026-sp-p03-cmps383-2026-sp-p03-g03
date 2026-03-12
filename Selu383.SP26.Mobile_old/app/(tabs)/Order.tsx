import React, {useState} from 'react';
import {Text, ImageBackground, View, Image, ScrollView, TextInput, Button, FlatList, StyleSheet, SectionList} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';


import { offset } from '@expo/ui/jetpack-compose/modifiers';

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
				color="#ffffff"
				onPress={() => {
						setIsHungry(false);
				}}
				disabled={!isHungry}
				title={isHungry ? 'Give me food, please!' : 'Danke schon'}
			/>
			
		</View>
	);
};

type OrderProps = {
	name: string;
};

const Order = (props: OrderProps) => {
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

type MenuProps = {
	name: string;
	price: string;
};

const MenuItem = (props:MenuProps) => {
	
	const [isOrdered, setIsOrdered] = useState(true);
	return (
		<View>
			<h2 style={{fontSize: 32}}>{props.name}!</h2>
			<h3 style={{fontSize: 20}}>Price: ${props.price}!</h3>
			<Button 
				color="#65a30d"
				
				onPress={() => {
						setIsOrdered(false);
				}}
				disabled={!isOrdered}
				title={isOrdered ? 'Order Item?' : 'Item Ordered'}
			/>
			
		
		</View>
		
		
	);
};


const Cafe1 = () => {
	return (
		<SafeAreaProvider style={{backgroundColor: '#65a30d' }}>
		<h1>We sell coffee here sir!</h1>
				
				<MenuItem name="Expresso" price="31.2" />
				<MenuItem name="Coffee" price="3.12" />
				<MenuItem name="Baguette" price=".312" />
				
				<ExternalLink href="http://localhost:8081/PaymentConfirmation">
				  <ThemedText type="link">Move to Checkout!</ThemedText>
				</ExternalLink>	
		
			<Cat2 name="Lucy"/>
			<Cat2 name="Piep"/>
		</SafeAreaProvider>
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
    backgroundColor: '#65a30d',
  },
});



export default Cafe1;