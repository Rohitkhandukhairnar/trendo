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
  ActivityIndicator
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {launchImageLibrary} from 'react-native-image-picker';

// Use the same themes from your NewsListScreen
const themes = {
  light: {
    primary: '#FF6B35',
    background: '#F7F7F7',
    card: '#FFFFFF',
    text: '#292929',
    border: '#E0E0E0',
    secondaryText: '#666666',
  },
  dark: {
    primary: '#FF6B35',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#333333',
    secondaryText: '#AAAAAA',
  },
};

const ProfileScreen = ({navigation, route}) => {
  const { isDark } = route.params || { isDark: false };
  const theme = isDark ? themes.dark : themes.light;
  
  const user = auth().currentUser;
  const [userData, setUserData] = useState({
    displayName: user.displayName || '',
    email: user.email,
    photoBase64: null,
  });
  const [loading, setLoading] = useState(false);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firestore()
          .collection('users')
          .doc(user.uid)
          .get();
        
        if (userDoc.exists) {
          setUserData(prev => ({
            ...prev,
            ...userDoc.data()
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
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
        quality: 0.5, // Lower quality to reduce size
        includeBase64: true, // This gives us the base64 string
      });

      if (result.didCancel) return;

      setLoading(true);
      const image = result.assets[0];

      // Update user data in Firestore with base64 image
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          photoBase64: image.base64,
          displayName: user.displayName,
          email: user.email,
          lastUpdated: firestore.FieldValue.serverTimestamp()
        }, { merge: true });

      // Update local state
      setUserData(prev => ({
        ...prev,
        photoBase64: image.base64
      }));

      ToastAndroid.show('Profile image updated!', ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the image URI
  const getImageUri = () => {
    if (userData.photoBase64) {
      return `data:image/jpeg;base64,${userData.photoBase64}`;
    }
    return 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
  };

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.background}]}>
      <View style={[styles.profileHeader, {borderBottomColor: theme.border}]}>
        <TouchableOpacity onPress={changeProfileImage}>
          <Image 
            source={{uri: getImageUri()}} 
            style={styles.profileImage} 
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={[styles.userName, {color: theme.text}]}>
          {userData.displayName || 'No Name'}
        </Text>
        <Text style={[styles.userEmail, {color: theme.secondaryText}]}>
          {userData.email}
        </Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuItem, {borderBottomColor: theme.border}]}
          onPress={() => navigation.navigate('AboutUsScreen', { isDark })}>
          <Text style={[styles.menuText, {color: theme.text}]}>About Us</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, {borderBottomColor: theme.border}]}
          onPress={() => navigation.navigate('PrivacyPolicyScreen', { isDark })}>
          <Text style={[styles.menuText, {color: theme.text}]}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, {borderBottomColor: theme.border}]}
          onPress={handleChangePassword}>
          <Text style={[styles.menuText, {color: theme.text}]}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton, {backgroundColor: theme.primary}]}
          onPress={handleLogout}>
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  loadingOverlay: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 30,
    borderRadius: 8,
    alignItems: 'center',
    padding: 15,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;