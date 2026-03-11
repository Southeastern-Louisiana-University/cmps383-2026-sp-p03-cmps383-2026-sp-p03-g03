import React, {useState} from 'react';
import {Text, View, Image, ScrollView, TextInput, Button, FlatList, StyleSheet, SectionList} from 'react-native';

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
				<MenuItem name="Miscellaneous Intestinal Illness" price=".0312" />
			</View>
		);

};

export default Menu;