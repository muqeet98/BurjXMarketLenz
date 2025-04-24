// src/components/TabBar.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { TabType } from '../types';
import { useTheme } from '../hooks/useTheme';

interface TabBarProps {
  tabs: TabType[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                isActive && [styles.activeTab, { borderBottomColor: theme.accent }]
              ]}
              onPress={() => onTabChange(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? theme.accent : theme.secondaryText }
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TabBar;