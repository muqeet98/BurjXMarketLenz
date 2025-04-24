// src/components/TabBar.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView ,Image} from 'react-native';
import { TabType } from '../types';
import { useTheme } from '../hooks/useTheme';
import { wp } from '../utils/Responsiveness';
import { iconPath } from '../constants/Icons';

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
                isActive && [styles.activeTab, { borderBottomColor: theme.BurjXGreen }]
              ]}
              onPress={() => onTabChange(tab)}
              activeOpacity={0.7}
            >
              <Image source={ tab == 'Featured'? iconPath?.starIcon : tab=='Top Gainers'? iconPath?.Rocket: iconPath.RedFlag} style={{width:20, height:20}}/>
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? theme.BurjXGreen : theme.secondaryText }
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
    paddingHorizontal: 26,
    marginRight: 16,
    flexDirection:'row'
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default TabBar;