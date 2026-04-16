import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  titleLogo: {
    width: 34,
    height: 34,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryScrollContent: {
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemCount: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  featuredHint: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  itemBlock: {
    marginBottom: 2,
    borderRadius: 12,
  },
  managerRow: {
    alignItems: "flex-end",
    marginTop: -4,
    marginBottom: 10,
  },
  managerButton: {
    borderRadius: 10,
    minHeight: 40,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  managerButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
