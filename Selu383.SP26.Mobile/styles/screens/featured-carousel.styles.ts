import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: 0,
    marginBottom: 2,
  },
  itemCard: {
    borderRadius: 18,
    backgroundColor: '#2f2f2f',
    borderWidth: 0,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  itemImage: {
    width: '100%',
    height: 118,
    resizeMode: 'cover',
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    bottom: '45%',
    backgroundColor: 'rgba(0,0,0,0.14)',
  },
  itemContent: {
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 11,
  },
  itemCategory: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.74)',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Oregano_400Regular',
    color: '#fff',
    marginBottom: 4,
    lineHeight: 22,
  },
  itemDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.86)',
    lineHeight: 16,
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Corben_700Bold',
    color: '#fff',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
