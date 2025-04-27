// src/screens/HomeScreen/styles.ts
import { StyleSheet, Platform } from 'react-native';
import { wp } from '../../utils/Responsiveness';
import { FEATURED_ITEM_WIDTH } from './constants';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#13151A',
    },
    safeArea: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    categoriesSection: {
        backgroundColor: '#1B1B1B',
        paddingTop: 16,
        paddingBottom: 20,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingLeft: wp(5),
        borderBottomWidth: 0.5,
        borderBottomColor: '#262626',
        marginBottom: 16,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 8,
    },
    featuredListContainer: {
        height: 190,
    },
    featuredListContent: {
        paddingLeft: 16,
        paddingRight: 8,
    },
    featuredCard: {
        backgroundColor: '#1B1B1B',
        borderRadius: 12,
        padding: 16,
        width: FEATURED_ITEM_WIDTH,
        marginRight: 8,
        borderWidth: 0.3,
        borderColor: '#3F3F3F',
        height: 170,
    },
    featuredHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chartContainer: {
        height: 50,
        marginVertical: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    allCoinsSection: {
        flex: 1,
    },
    searchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        marginTop: wp(5),
        marginBottom: wp(2)
    },
    tabContainer: {
        width: '35%',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#4CAF50',
        justifyContent: 'center'
    },
    searchContainer: {
        borderRadius: wp(20),
        width: '55%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative'
    },
    searchInput: {
        padding: wp(3),
        paddingRight: wp(10),
        paddingLeft: wp(5),
        height: wp(12),
        borderRadius: wp(20),
        fontSize: wp(4),
        width: '100%'
    },
    searchIcon: {
        position: 'absolute',
        right: wp(3)
    },
    card: {
        backgroundColor: '#1B1B1B',
        borderRadius: 12,
        padding: 20,
        paddingVertical: 15,
        marginVertical: 2,
        width: '90%',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: wp(8),
        height: wp(8),
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        marginLeft: 10,
    },
    body: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    percentageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2C2C2C',
        padding: 5,
        borderRadius: 5
    },
    percentageText: {
        fontWeight: 'bold',
        color: '#4CAF50',
        fontSize: wp(3)
    },
    headerIndicatorContainer: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    emptyContainer: {
        padding: wp(10),
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyFeaturedContainer: {
        flex: 1,
        width: FEATURED_ITEM_WIDTH * 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyText: {
        color: '#898989',
        fontSize: wp(4),
        textAlign: 'center'
    },
    footerLoader: {
        marginVertical: wp(5)
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    retryText: {
        marginTop: 10,
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    listContentContainer: {
        paddingBottom: wp(20),
        minHeight: '100%',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    offlineContainer: {
        backgroundColor: '#FF3B30',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    offlineText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    endOfListContainer: {
        padding: wp(5),
        alignItems: 'center',
    },
    endOfListText: {
        color: '#898989',
        fontSize: wp(3),
    },
});