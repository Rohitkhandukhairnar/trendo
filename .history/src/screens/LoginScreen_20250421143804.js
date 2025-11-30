import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NewsDrawerNavigation from './NewsScreen';

const Stack = createNativeStackNavigator();

const GoogleAuthentication = () => {
  const [initialRoute, setInitialRoute] = useState('SignIn');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '205933823942-5f7bg50qkacf38qgdlacfoda88ft302j.apps.googleusercontent.com',
      offlineAccess: true,
    });

    const checkUserSignIn = async () => {
      try {
        const userInfo = await GoogleSignin.getCurrentUser ();
        if (userInfo) {
          setInitialRoute('NewsScreen');
        }
      } catch (error) {
        console.error('Error checking user sign-in status:', error);
      } finally {
        setLoading(false);
      }
    };
    checkUserSignIn();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="NewsScreen" component={NewsDrawerNavigation}/>
    </Stack.Navigator>
  );
};

const SignInScreen = ({ navigation }) => {
  const signInWithGoogle = async () => {
    try {
      // await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });//here 
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
      navigation.replace('NewsScreen');
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User  cancelled the sign-in process');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-in is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available');
      } else {
        console.error(error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <GoogleSigninButton
        style={styles.signInButton}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Auto}
        onPress={signInWithGoogle}
      />
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true); // State to track image loading

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfo = await GoogleSignin.getCurrentUser ();
        if (userInfo) {
          setUserData(userInfo.user);
          console.log('Fetched User Data:', userInfo.user);
        } else {
          console.log('No user data found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      navigation.replace('SignIn');
      console.log('User  signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Loading user information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userData.photo && (
        <>
          {loadingImage && <ActivityIndicator size="large" color="#0000ff" />}
          <Image
            source={{ uri: userData.photo }}
            style={styles.profileImage}
            onLoadEnd={() => setLoadingImage(false)} // Set loadingImage to false when the image has loaded
            onLoadStart={() => setLoadingImage(true)} // Set loadingImage to true when the image starts loading
          />
        </>
      )}
      <Text style={styles.text}>Name: {userData.name}</Text>
      <Text style={styles.text}>Email: {userData.email}</Text>
      <TouchableOpacity style={styles.signOut} onPress={signOut}>
        <Text style={styles.text}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  signInButton: {
    width: 230,
    height: 48,
  },
  signOut: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f0bef7",
    padding: 4,
    paddingHorizontal: 20,
    borderRadius: 100,
    marginTop: 20,
    elevation: 1,
    shadowColor: 'black',
    shadowOpacity: 1,
    shadowOffset: {
      height: 20,
      width: 20
    }
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    marginVertical: 4,
    fontWeight: '500'
  },
});

export default GoogleAuthentication;

