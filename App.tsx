import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
// import { ThemeProvider } from './hooks/useTheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/hooks/useTheme';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30000,
        },
    },
});

const App = () => {
    return (
        <Provider store={store}>
            <ThemeProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <QueryClientProvider client={queryClient}>
                        <SafeAreaProvider>
                            <NavigationContainer>
                                <AppNavigator />
                            </NavigationContainer>
                        </SafeAreaProvider>
                    </QueryClientProvider>
                </GestureHandlerRootView>
            </ThemeProvider>
        </Provider>

    );
};

export default App;