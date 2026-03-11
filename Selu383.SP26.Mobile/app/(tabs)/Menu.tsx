import React from 'react';
import {Text, ImageBackground, View, Image, ScrollView, TextInput, Button, FlatList, StyleSheet, SectionList} from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';




type MenuProps = {
	name: string;
	price: string;
};

const MenuItem = (props:MenuProps) => {
	return (
		<View>
			<h2 style={{fontSize: 32}}>{props.name}!</h2>
			<h3 style={{fontSize: 20}}>Price: ${props.price}!</h3>
			
			
		
		</View>
		
		
	);
};

const Menu = () => {
		return (	
			<View>
			  <ImageBackground source={require('./roofie.png')} resizeMode="cover" style={styles.image}>
				<Text style={styles.text}>ORDER COMPLETED</Text>
			  </ImageBackground>
				<h1>We sell coffee here sir!</h1>
				
				<MenuItem name="Expresso" price="31.2" />
				<MenuItem name="Coffee" price="3.12" />
				<MenuItem name="Baguette" price=".312" />
				
				<ExternalLink href="http://localhost:8081/Order">
				  <ThemedText type="link">Make Order!</ThemedText>
				</ExternalLink>	
			</View>
		);

};


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
export default Menu;