import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

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

export default Menu;