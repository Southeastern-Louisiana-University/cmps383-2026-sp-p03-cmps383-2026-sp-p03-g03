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

const PayConfirmation = () => {
	return (
		<>
			<ImageBackground source={require('./maxresdefault.jpg')} resizeMode="cover" style={styles.image}>
				<Text style={styles.text}>CONFIRM ORDER?</Text>
			  </ImageBackground>
			<ExternalLink href="http://localhost:8081/CheckOut">
				  <ThemedText type="link">Confirm Purchase</ThemedText>
			</ExternalLink>	
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
    backgroundColor: '#65a30d',
  },
});


export default PayConfirmation;