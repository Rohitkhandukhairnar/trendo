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
import storage from '@react-native-firebase/storage';

const ProfileScreen = ({navigation, route}) => {
  const user = auth().currentUser;
  const [userData, setUserData] = useState({
    displayName: user.displayName || '',
    email: user.email,
    photoURL: user.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
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

  const handleChangePassword = async () => {
    navigation.navigate('ChangePasswordScreen');
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
        quality: 0.8,
      });

      if (result.didCancel) return;

      setLoading(true);
      const image = result.assets[0];

      // Upload image to Firebase Storage
      const reference = storage().ref(`profile_images/${user.uid}`);
      await reference.putFile(image.uri);

      // Get download URL
      const url = await reference.getDownloadURL();

      // Update user profile in Firebase Auth
      await user.updateProfile({
        photoURL: url,
      });

      // Update user data in Firestore
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          photoURL: url,
          displayName: user.displayName,
          email: user.email,
        }, { merge: true });

      // Update local state
      setUserData(prev => ({
        ...prev,
        photoURL: url
      }));

      ToastAndroid.show('Profile image updated!', ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={changeProfileImage}>
          <Image source={{uri: userData.photoURL}} style={styles.profileImage} />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.userName}>{userData.displayName || 'No Name'}</Text>
        <Text style={styles.userEmail}>{userData.email}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AboutUsScreen')}>
          <Text style={styles.menuText}>About Us</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
          <Text style={styles.menuText}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleChangePassword}>
          <Text style={styles.menuText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}>
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ... (keep the same styles as before)

export default ProfileScreen;