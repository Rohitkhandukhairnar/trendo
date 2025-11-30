import React, {useState, useEffect, useRef} from 'react';
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
  Easing,
  Touchable,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {getAuth} from '@react-native-firebase/auth';
import ProfileScreen from './ProfileScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';
import AboutUsScreen from './AboutUsScreen';

const API_KEY = 'pub_81891621dec89d3068e7f7d4ae39091dbc217';
const Stack = createStackNavigator();
const {width} = Dimensions.get('window');

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
  },
};

const categories = [
  {id: 'top', name: 'Top Stories'},
  {id: 'politics', name: 'Politics'},
  {id: 'business', name: 'Business'},
  {id: 'technology', name: 'Technology'},
  {id: 'sports', name: 'Sports'},
  {id: 'entertainment', name: 'Entertainment'},
  {id: 'health', name: 'Health'},
  {id: 'science', name: 'Science'},
];

const ImageWithLoader = ({uri, style}) => {
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
        source={{uri}}
        style={[style, loading ? styles.hiddenImage : styles.visibleImage]}
        resizeMode="cover"
        onLoad={() => setLoading(false)}
      />
    </View>
  );
};

const NewsListScreen = ({navigation, route}) => {
  const [isDark, setIsDark] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('top');
  const [showCategories, setShowCategories] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.7)).current;
  const theme = isDark ? themes.dark : themes.light;
  const userData = getAuth().currentUser;
  console.log(userData);


  import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ToastAndroid,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput
} from 'react-native';
import auth, { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {launchImageLibrary} from 'react-native-image-picker';

const themes = {
  light: {
    primary: '#FF6B35',
    background: '#F7F7F7',
    card: '#FFFFFF',
    text: '#292929',
    border: '#E0E0E0',
    secondaryText: '#666666',
    buttonText: '#FFFFFF',
  },
  dark: {
    primary: '#FF6B35',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#333333',
    secondaryText: '#AAAAAA',
    buttonText: '#FFFFFF',
  },
};

const ProfileScreen = ({navigation, route}) => {
  const { isDark } = route.params || { isDark: false };
  const theme = isDark ? themes.dark : themes.light;

  const user = getAuth().currentUser;
  const [userData, setUserData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
  });
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const initializeUserData = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
          await firestore().collection('users').doc(user.uid).set({
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            createdAt: firestore.FieldValue.serverTimestamp(),
            lastUpdated: firestore.FieldValue.serverTimestamp()
          });
        }

        const updatedDoc = await firestore().collection('users').doc(user.uid).get();
        const data = updatedDoc.data() || {};
        setUserData({
          displayName: data.displayName || '',
          email: data.email || '',
          photoURL: data.photoURL || ''
        });
        setNewName(data.displayName || '');
      } catch (error) {
        console.error('Error initializing user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    initializeUserData();
  }, [user.uid]);

  const handleChangePassword = () => {
    navigation.navigate('ChangePasswordScreen', { isDark });
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('LoginScreen');
      ToastAndroid.show('Logged out successfully', ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const changeProfileImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: true,
      });

      if (result.didCancel) return;

      setImageLoading(true);
      const image = result.assets[0];
      const base64Image = `data:${image.type};base64,${image.base64}`;

      await firestore().collection('users').doc(user.uid).update({
        photoURL: base64Image || '',
        lastUpdated: firestore.FieldValue.serverTimestamp()
      });

      const updatedDoc = await firestore().collection('users').doc(user.uid).get();
      const data = updatedDoc.data() || {};
      setUserData(prev => ({
        ...prev,
        photoURL: data.photoURL || ''
      }));

      ToastAndroid.show('Profile image updated!', ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setImageLoading(false);
    }
  };

  const handleNameChange = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      
      await user.updateProfile({
        displayName: newName.trim()
      });

      await firestore().collection('users').doc(user.uid).update({
        displayName: newName.trim(),
        lastUpdated: firestore.FieldValue.serverTimestamp()
      });

      setUserData(prev => ({
        ...prev,
        displayName: newName.trim()
      }));
      
      setNameModalVisible(false);
      ToastAndroid.show('Name updated successfully!', ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageSource = () => {
    if (userData.photoURL) {
      return { uri: userData.photoURL };
    }
    return require('../assets/images/avatar.png');
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: theme.background}]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView style={[styles.container, {backgroundColor: theme.background}]}>
        <View style={[styles.profileCard, {backgroundColor: theme.card}]}>
          <TouchableOpacity onPress={changeProfileImage} style={styles.imageContainer}>
            <Image 
              source={getImageSource()} 
              style={styles.profileImage} 
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            {imageLoading && (
              <View style={[styles.imageOverlay, {backgroundColor: theme.card}]}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            )}
            <View style={[styles.editBadge, {backgroundColor: theme.primary}]}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <TouchableOpacity onPress={() => setNameModalVisible(true)}>
              <Text style={[styles.userName, {color: theme.text}]} numberOfLines={1}>
                {userData.displayName || 'No Name'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.userEmail, {color: theme.secondaryText}]} numberOfLines={1}>
              {userData.email}
            </Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={[styles.menuItem, {backgroundColor: theme.card, borderColor: theme.border}]}
            onPress={() => navigation.navigate('AboutUsScreen', { isDark })}>
            <Text style={[styles.menuText, {color: theme.text}]}>About Us</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, {backgroundColor: theme.card, borderColor: theme.border}]}
            onPress={() => navigation.navigate('PrivacyPolicyScreen', { isDark })}>
            <Text style={[styles.menuText, {color: theme.text}]}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, {backgroundColor: theme.card, borderColor: theme.border}]}
            onPress={handleChangePassword}>
            <Text style={[styles.menuText, {color: theme.text}]}>Change Password</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, {backgroundColor: theme.primary}]}
          onPress={handleLogout}>
          <Text style={[styles.logoutText, {color: theme.buttonText}]}>Logout</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={nameModalVisible}
          onRequestClose={() => setNameModalVisible(false)}>
          <View style={[styles.modalContainer, {backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'}]}>
            <View style={[styles.modalContent, {backgroundColor: theme.card}]}>
              <Text style={[styles.modalTitle, {color: theme.text}]}>Edit Name</Text>
              
              <TextInput
                style={[styles.nameInput, {color: theme.text, borderColor: theme.border}]}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter your name"
                placeholderTextColor={theme.secondaryText}
                autoFocus={true}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, {backgroundColor: theme.background}]}
                  onPress={() => setNameModalVisible(false)}>
                  <Text style={[styles.modalButtonText, {color: theme.text}]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, {backgroundColor: theme.primary}]}
                  onPress={handleNameChange}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color={theme.buttonText} />
                  ) : (
                    <Text style={[styles.modalButtonText, {color: theme.buttonText}]}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 10
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FF6B35',
  },
  imageOverlay: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editBadgeText: {
    fontSize: 16,
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    maxWidth: '80%',
  },
  userEmail: {
    fontSize: 16,
    maxWidth: '80%',
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  nameInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

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
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {backgroundColor: theme.card, borderBottomColor: theme.border},
        ]}>
        <TouchableOpacity onPress={toggleCategories} activeOpacity={0.7}>
          <Text style={[styles.menuText, {color: theme.primary}]}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: theme.text}]}>
          {categories.find(c => c.id === selectedCategory)?.name || 'News'}
        </Text>
        <View style={styles.themeSwitchContainer}>
          <Image source={{uri:isDark?'https://cdn-icons-png.flaticon.com/128/702/702471.png':'https://cdn-icons-png.flaticon.com/128/10485/10485313.png'}} style={{width:20,height:20,marginRight:10,tintColor:theme.text}}/>
          <Switch
            value={isDark}
            onValueChange={() => setIsDark(!isDark)}
            thumbColor={theme.primary}
            trackColor={{false: '#FFD3C0', true: '#444444'}}
          />
        </View>
      </View>

      {/* Category Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: theme.card,
            transform: [{translateX: slideAnim}],
          },
        ]}>
   <TouchableOpacity 
  activeOpacity={0.8}
  onPress={() => navigation.navigate('Profile',{isDark:isDark})}
  style={{alignItems: 'center',
    marginBottom: 20,}}
>
  <Image
    source={{
      uri:
        userData.photoURL ||
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp3oYa9BljpcyhfIwVizBrEuo4HjsWq1mNzw&s',
    }}
    style={{
      width: 90,
      height: 90,
      alignSelf: 'center',
      borderRadius: 50,
      marginBottom: 20,
      backgroundColor: theme.primary,
    }}
  />
  <Text style={[styles.userDataText, {color: theme.text}]}>
    {userData.displayName}
  </Text>
  <Text style={[styles.userDataText, {color: theme.text}]}>
    {userData.email}
  </Text>
</TouchableOpacity>
        <Text style={[styles.drawerTitle, {color: theme.primary}]}>
          Categories
        </Text>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.drawerItem,
              selectedCategory === category.id && {
                backgroundColor: theme.background,
                borderLeftWidth: 4,
                borderLeftColor: theme.primary,
              },
            ]}
            onPress={() => {
              setSelectedCategory(category.id);
              toggleCategories();
            }}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.drawerItemText,
                {
                  color:
                    selectedCategory === category.id
                      ? theme.primary
                      : theme.text,
                },
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

const NewsListContent = ({category, theme, navigation, isDark}) => {
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

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[styles.newsCard, {backgroundColor: theme.card}]}
      onPress={() =>
        navigation.navigate('NewsDetail', {
          article: item,
          isDark: isDark, // Pass theme state to detail screen
        })
      }
      activeOpacity={0.8}>
      {item.image_url && (
        <ImageWithLoader uri={item.image_url} style={styles.newsImage} />
      )}
      <View style={styles.newsContent}>
        <Text style={[styles.newsTitle, {color: theme.text}]}>
          {item.title}
        </Text>
        <Text style={[styles.newsSource, {color: theme.primary}]}>
          {item.source_id}
        </Text>
        <Text
          style={[styles.newsDesc, {color: theme.secondaryText}]}
          numberOfLines={3}>
          {item.description || item.content}
        </Text>
        <View style={styles.newsFooter}>
          <Text style={[styles.newsDate, {color: theme.secondaryText}]}>
            {new Date(item.pubDate).toLocaleDateString()}
          </Text>
          <Text style={{color: theme.primary}}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, {backgroundColor: theme.background}]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={articles}
      renderItem={renderItem}
      keyExtractor={item => item.article_id}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {color: theme.text}]}>
            No articles found
          </Text>
        </View>
      }
    />
  );
};

const NewsDetailScreen = ({navigation, route}) => {
  const {article, isDark} = route.params;
  const theme = isDark ? themes.dark : themes.light;

  const handleOpenOriginal = () => {
    if (article.link) {
      Linking.openURL(article.link);
    }
  };

  return (
    <SafeAreaView
      style={[styles.detailContainer, {backgroundColor: theme.background}]}>
      <ScrollView contentContainerStyle={styles.detailScroll}>
        {article.image_url && (
          <ImageWithLoader uri={article.image_url} style={styles.detailImage} />
        )}

        <View style={[styles.detailContent, {backgroundColor: theme.card}]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}>
            <Text style={[styles.backText, {color: theme.primary}]}>
              ← Back
            </Text>
          </TouchableOpacity>

          <Text style={[styles.detailTitle, {color: theme.text}]}>
            {article.title}
          </Text>

          <View style={styles.metaContainer}>
            <Text style={[styles.detailAuthor, {color: theme.primary}]}>
              {article.source_id}
            </Text>
            <Text style={[styles.detailDate, {color: theme.secondaryText}]}>
              {new Date(article.pubDate).toLocaleDateString()}
            </Text>
          </View>

          {/* Show full content without truncation */}
          <Text style={[styles.detailDesc, {color: theme.text}]}>
            {article.description || article.content}
          </Text>

          {article.link && (
            <TouchableOpacity
              style={[
                styles.readOriginalButton,
                {backgroundColor: theme.primary},
              ]}
              onPress={handleOpenOriginal}
              activeOpacity={0.8}>
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
        }} initialRouteName='NewsList'>
        <Stack.Screen name="NewsList" component={NewsListScreen} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />

           <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} 
                options={{ title: 'Change Password' }} />
              <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} 
                options={{ title: 'Privacy Policy' }} />
              <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} 
                options={{ title: 'About Us' }} />
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 9,
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
    shadowOffset: {width: 0, height: 2},
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
  userDataText: {
    fontSize: 16,
    marginBottom: 10,
    alignSelf: 'center',
  },
});

export default App;
