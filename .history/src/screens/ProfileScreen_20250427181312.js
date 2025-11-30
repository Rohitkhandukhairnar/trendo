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
  TextInput // Add this import
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
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  });
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false); // Add this state
  const [newName, setNewName] = useState(''); // Add this state

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
        setNewName(updatedDoc.data().displayName || ''); // Initialize newName
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

  // Add this function to handle name change
  const handleNameChange = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      
      // Update in Firebase Auth
      await user.updateProfile({
        displayName: newName.trim()
      });

      // Update in Firestore
      await firestore().collection('users').doc(user.uid).update({
        displayName: newName.trim(),
        lastUpdated: firestore.FieldValue.serverTimestamp()
      });

      // Update local state
      const updatedDoc = await firestore().collection('users').doc(user.uid).get();
      setUserData(updatedDoc.data());
      
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

        {/* Name Edit Modal */}
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
  // ... (keep all your existing styles)

  // Add these new styles for the modal
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
    elevation:10
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