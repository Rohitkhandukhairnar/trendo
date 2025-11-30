import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  Linking,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

const API_KEY = 'pub_81891621dec89d3068e7f7d4ae39091dbc217';
const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

// Theme colors
const themes = {
  light: {
    primary: '#FF6B35',
    background: '#F7F7F7',
    card: '#FFFFFF',
    text: '#292929',
    border: '#E0E0E0',
    secondaryText: '#666666',
    categoryBackground: '#FFFFFF',
    categoryActive: '#FF6B35',
  },
  dark: {
    primary: '#FF6B35',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#333333',
    secondaryText: '#AAAAAA',
    categoryBackground: '#1E1E1E',
    categoryActive: '#FF6B35',
  }
};

const categories = [
  { id: 'top', name: 'Top Stories' },
  { id: 'politics', name: 'Politics' },
  { id: 'business', name: 'Business' },
  { id: 'technology', name: 'Technology' },
  { id: 'sports', name: 'Sports' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'health', name: 'Health' },
  { id: 'science', name: 'Science' },
];

const ImageWithLoader = ({ uri, style }) => {
  const [loading, setLoading] = useState(true);
  
  return (
    <View style={[style, styles.imageContainer]}>
      {loading && (
        <ActivityIndicator 
          style={styles.imageLoader} 
          color="#FF6B35" 
          size="small" 
        />
      )}
      <Image
        source={{ uri }}
        style={[style, loading ? styles.hiddenImage : styles.visibleImage]}
        resizeMode="cover"
        onLoad={() => setLoading(false)}
      />
    </View>
  );
};

const NewsListScreen = ({ navigation ,route}) => {
  const [isDark, setIsDark] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('top');
  const [showCategories, setShowCategories] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.7)).current;
  const theme = isDark ? themes.dark : themes.light;
  const [userData, setuserData] = useState(route.params?.userData || null);

  const toggleCategories = () => {
    if (showCategories) {
      Animated.timing(slideAnim, {
        toValue: -width * 0.7,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => setShowCategories(false));
    } else {
      setShowCategories(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={toggleCategories} activeOpacity={0.7}>
          <Text style={[styles.menuText, { color: theme.primary }]}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {categories.find(c => c.id === selectedCategory)?.name || 'News'}
        </Text>
        <View style={styles.themeSwitchContainer}>
          <Text style={{ color: theme.text, marginRight: 8 }}>
            {isDark ? '🌙' : '☀️'}
          </Text>
          <Switch
            value={isDark}
            onValueChange={() => setIsDark(!isDark)}
            thumbColor={theme.primary}
            trackColor={{ false: '#FFD3C0', true: '#444444' }}
          />
        </View>
      </View>

      {/* Category Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: theme.card,
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        <Image
          source={{
            uri:
              userData ||
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp3oYa9BljpcyhfIwVizBrEuo4HjsWq1mNzw&s',
          }}
          style={{width:40,height:40}}
        />
         <Text style={[styles.drawerTitle, { color: theme.primary }]}>Welcome, {userData.displayName || userData.email}!</Text>
        <Text style={[styles.drawerTitle, { color: theme.primary }]}>Categories</Text>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.drawerItem,
              selectedCategory === category.id && { 
                backgroundColor: theme.background,
                borderLeftWidth: 4,
                borderLeftColor: theme.primary,
              }
            ]}
            onPress={() => {
              setSelectedCategory(category.id);
              toggleCategories();
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.drawerItemText,
              { 
                color: selectedCategory === category.id 
                  ? theme.primary 
                  : theme.text,
              }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Overlay */}
      {showCategories && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleCategories}
        />
      )}

      {/* News List */}
      <NewsListContent 
        category={selectedCategory} 
        theme={theme} 
        navigation={navigation}
        isDark={isDark}
      />
    </SafeAreaView>
  );
};

const NewsListContent = ({ category, theme, navigation, isDark }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    try {
      let url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=in&language=en`;
      if (category !== 'top') {
        url += `&category=${category}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setArticles(data.results || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [category]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.newsCard, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate('NewsDetail', { 
        article: item,
        isDark: isDark // Pass theme state to detail screen
      })}
      activeOpacity={0.8}
    >
      {item.image_url && (
        <ImageWithLoader 
          uri={item.image_url}
          style={styles.newsImage}
        />
      )}
      <View style={styles.newsContent}>
        <Text style={[styles.newsTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.newsSource, { color: theme.primary }]}>{item.source_id}</Text>
        <Text style={[styles.newsDesc, { color: theme.secondaryText }]} numberOfLines={3}>
          {item.description || item.content}
        </Text>
        <View style={styles.newsFooter}>
          <Text style={[styles.newsDate, { color: theme.secondaryText }]}>
            {new Date(item.pubDate).toLocaleDateString()}
          </Text>
          <Text style={{ color: theme.primary }}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={articles}
      renderItem={renderItem}
      keyExtractor={(item) => item.article_id}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>No articles found</Text>
        </View>
      }
    />
  );
};

const NewsDetailScreen = ({ navigation, route }) => {
  const { article, isDark } = route.params;
  const theme = isDark ? themes.dark : themes.light;

  const handleOpenOriginal = () => {
    if (article.link) {
      Linking.openURL(article.link);
    }
  };

  return (
    <SafeAreaView style={[styles.detailContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.detailScroll}>
        {article.image_url && (
          <ImageWithLoader 
            uri={article.image_url}
            style={styles.detailImage}
          />
        )}
        
        <View style={[styles.detailContent, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
          >
            <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={[styles.detailTitle, { color: theme.text }]}>{article.title}</Text>
          
          <View style={styles.metaContainer}>
            <Text style={[styles.detailAuthor, { color: theme.primary }]}>{article.source_id}</Text>
            <Text style={[styles.detailDate, { color: theme.secondaryText }]}>
              {new Date(article.pubDate).toLocaleDateString()}
            </Text>
          </View>
          
          {/* Show full content without truncation */}
          <Text style={[styles.detailDesc, { color: theme.text }]}>
          {article.description || article.content}
          </Text>
          
          {article.link && (
            <TouchableOpacity 
              style={[styles.readOriginalButton, { backgroundColor: theme.primary }]}
              onPress={handleOpenOriginal}
              activeOpacity={0.8}
            >
              <Text style={styles.readOriginalText}>Read Full Article</Text>
              <Text style={styles.externalLinkIcon}>↗</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="NewsList" component={NewsListScreen} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      </Stack.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  menuText: {
    fontSize: 24,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  themeSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.7,
    paddingTop: 80,
    paddingHorizontal: 20,
    zIndex: 50,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  drawerItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 5,
    borderRadius: 5,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
  },
  newsCard: {
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  imageLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  hiddenImage: {
    opacity: 0,
  },
  visibleImage: {
    opacity: 1,
  },
  newsImage: {
    width: '100%',
    height: 200,
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newsSource: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  newsDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 12,
  },
  detailContainer: {
    flex: 1,
  },
  detailScroll: {
    paddingBottom: 20,
  },
  detailImage: {
    width: '100%',
    height: 250,
  },
  detailContent: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 30,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailAuthor: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailDate: {
    fontSize: 14,
  },
  detailDesc: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  readOriginalButton: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readOriginalText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginRight: 8,
  },
  externalLinkIcon: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default App;