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
  StatusBar
} from 'react-native';
import  { getAuth } from '@react-native-firebase/auth';
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
    displayName: userData.displayName,
    email: '',
    photoURL: '',
  });
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);

  // Initialize or update user data in Firestore
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
          // Create new user document if doesn't exist
          await firestore().collection('users').doc(user.uid).set({
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            createdAt: firestore.FieldValue.serverTimestamp(),
            lastUpdated: firestore.FieldValue.serverTimestamp()
          });
        }

        // Get the latest data
        const updatedDoc = await firestore().collection('users').doc(user.uid).get();
        setUserData(updatedDoc.data());
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

      // Update Firestore with the new image
      await firestore().collection('users').doc(user.uid).update({
        photoURL: base64Image,
        lastUpdated: firestore.FieldValue.serverTimestamp()
      });

      // Update local state
      const updatedDoc = await firestore().collection('users').doc(user.uid).get();
      setUserData(updatedDoc.data());

      ToastAndroid.show('Profile image updated!', ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setImageLoading(false);
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
        {/* Profile Header */}
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
            <Text style={[styles.userName, {color: theme.text}]} numberOfLines={1}>
              {userData.displayName || 'No Name'}
            </Text>
            <Text style={[styles.userEmail, {color: theme.secondaryText}]} numberOfLines={1}>
              {userData.email}
            </Text>
          </View>
        </View>

        {/* Menu Options */}
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

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, {backgroundColor: theme.primary}]}
          onPress={handleLogout}>
          <Text style={[styles.logoutText, {color: theme.buttonText}]}>Logout</Text>
        </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
});

export default ProfileScreen;