import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import type { LocationInterface } from "../Interfaces";

// Dummy data for visualization since API calls were removed
const MOCK_LOCATIONS: LocationInterface[] = [
  {
    id: "1",
    name: "Downtown Bistro",
    address: "123 Main St",
    city: "Metropolis",
    state: "NY",
    zip: "10001",
    phone: "555-0123",
    openingTime: "7:00am",
    closingTime: "7:00pm",
    isActive: true,
  },
  {
    id: "2",
    name: "Westside Cafe",
    address: "456 West Ave",
    city: "Goattown",
    state: "NJ",
    zip: "10002",
    phone: "555-0456",
    openingTime: "7:00am",
    closingTime: "7:00pm",
    isActive: true,
  },
  {
    id: "3",
    name: "Booger Hill Hub",
    address: "789 Pine Ln",
    city: "Booger Hill",
    state: "WV",
    zip: "10003",
    phone: "532-0456",
    openingTime: "7:00am",
    closingTime: "7:00pm",
    isActive: true,
  }
];

function Locations() {
  // If you want to pass these as props instead, change the signature to:
  // function Locations({ locations }: { locations: LocationInterface[] })
  const locations = MOCK_LOCATIONS;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Locations</Text>
      
      <View style={styles.grid}>
        {locations.map((loc) => (
          <View key={loc.id} style={styles.card}>
            <Text style={styles.cardTitle}>{loc.name}</Text>

            <Text style={styles.text}>
              {loc.address}, {loc.city}, {loc.state} {loc.zip}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Phone:</Text> {loc.phone}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Hours:</Text> {loc.openingTime ?? "7:00am"} - {loc.closingTime ?? "7:00pm"}
            </Text>

            <Text style={[styles.status, { color: loc.isActive ? "#2e7d32" : "#ed6c02" }]}>
              Status: {loc.isActive ? "Open" : "Coming Soon"}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 24,
  },
  grid: {
    gap: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android Shadow
    elevation: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginBottom: 4,
  },
  label: {
    fontWeight: "600",
    color: "#333",
    textDecorationLine: "underline",
  },
  status: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default Locations;