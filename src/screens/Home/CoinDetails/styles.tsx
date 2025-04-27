import { StyleSheet, Platform, Dimensions } from 'react-native';
import { wp } from '../../../utils/Responsiveness';
const SCREEN_WIDTH = Dimensions.get('window').width;
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#13151A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 8,
        justifyContent: 'space-between',
        height: 48,
    },
    backButton: {
        marginRight: 16,
        padding: wp(3),
        borderRadius: wp(20),
        backgroundColor: '#252627',
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cryptoSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        paddingHorizontal: 8,
    },
    cryptoIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    cryptoIconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    placeholder: {
        width: 24,
        height: 24,
    },
    cryptoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2D35',
        height: 50,
    },
    activeCryptoItem: {
        backgroundColor: '#2A2D35',
        borderRadius: 8,
    },
    cryptoItemName: {
        color: '#fff',
        fontSize: 14,
    },
    priceContainer: {
        paddingHorizontal: 16,
        marginTop: 24,
        height: 80,
    },
    changeContainer: {
        marginTop: 4,
        backgroundColor: '#1E2026',
        padding: wp(2),
        borderRadius: 8,
        height: 32,
        justifyContent: 'center',
    },
    changeText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    chartToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        marginTop: 16,
        height: 40,
    },
    toggleButton: {
        padding: 8,
        marginLeft: 12,
        borderRadius: 8,
        backgroundColor: '#1E2026',
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeToggle: {
        backgroundColor: '#2A2D35',
    },
    chartContainer: {
        marginTop: 16,
        paddingHorizontal: 10,
        alignItems: 'center',
        height: 220,
        justifyContent: 'center',
    },
    emptyChart: {
        width: SCREEN_WIDTH - 20,
        height: 220,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyChartText: {
        color: '#888',
        fontSize: 16,
    },
    timeFrameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 16,
        height: 40,
    },
    timeFrameButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedTimeFrame: {
        backgroundColor: '#CDFF00',
    },
    additionalDataContainer: {
        backgroundColor: '#1E2026',
        margin: 16,
        borderRadius: 12,
        padding: 16,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: Platform.OS === 'android' ? 0.5 : 1, // Thinner borders on Android
        borderBottomColor: '#2A2D35',
        height: 40,
    },
    dataLabel: {
        color: '#888',
        fontSize: 14,
    },
    dataValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    // Bottom sheet styles
    bottomSheetBackground: {
        backgroundColor: '#1E2026',
    },
    bottomSheetIndicator: {
        backgroundColor: '#86FF00',
        width: 40,
    },
    bottomSheetHeader: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2D35',
    },
    bottomSheetTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    bottomSheetContent: {
        paddingHorizontal: 16,
    }
});
