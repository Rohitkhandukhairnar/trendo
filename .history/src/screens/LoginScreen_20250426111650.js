import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import LottieView from 'lottie-react-native';

// for create client id go in firebase and create new project and select Add Firebase to Google Cloud project

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    '', // Get from google console Console -> credential
});

const FirebaseLoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleloading, setgoogleLoading] = useState(false);
  const [facebookloading, setfacebookLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Check if user is already logged in
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      if (user) {
        // Check if email is verified before considering user logged in
        if (user.emailVerified) {
          console.log('User logged in with verified email:', user);
          setUserData(user);
        } else {
          if(user.providerData.length>0 && user.providerData[0].providerId==="facebook.com"){
            setUserData(user);
            console.log("facebook login happening")
            console.log(user);
          }
          else{
            console.log('User email not verified');
            ToastAndroid.show("User email not verified",ToastAndroid.SHORT);
            GoogleSignin.signOut();
            LoginManager.logOut();
            auth().signOut();
          }
        }
      } else {
        console.log('No user logged in');
        setUserData(null);
      }
      setInitializing(false); 
    });
    return subscriber;
  }, []);

  if (initializing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ff8400" />
      </View>
    );
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill all fields');
      ToastAndroid.show('Please fill all fields', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
       // Check if email is verified
    if (!userCredential.user.emailVerified) {
      // await auth().signOut();
      Alert.alert(
        'Email Not Verified',
        'Please verify your email before logging in. Check your inbox for the verification email.',
        [
          {
            text: 'Resend Verification',
            onPress: async () => {
              try {
                await userCredential.user.sendEmailVerification();
                ToastAndroid.show('Verification email resent!', ToastAndroid.SHORT);
              } catch (error) {
                ToastAndroid.show(error.message, ToastAndroid.SHORT);
              }
            }
          },
          { text: 'OK' }
        ]
      );
      return;
    }
      console.log('Email login successful:', userCredential.user);
      ToastAndroid.show('Login successful', ToastAndroid.SHORT);
      setUserData(userCredential.user);
    } catch (err) {
      console.log('Email login error:', err);
      ToastAndroid.show('Login Failed', ToastAndroid.SHORT);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleButtonPress = async () => {
    try {
      // Check if your device supports Google Play
      setgoogleLoading(true);
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Get the users ID token
      const userData = await GoogleSignin.signIn();
      console.log('Google ID token:', userData.data.idToken);

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(
        userData.data.idToken,
      );

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      setgoogleLoading(false);
      console.log('Google login successful:', userCredential.user);
      ToastAndroid.show('Google login successful', ToastAndroid.SHORT);
      setUserData(userCredential.user);
    } catch (error) {
      console.log('Google login error:', error);
      ToastAndroid.show('Login Failed', ToastAndroid.SHORT);
      setError(error.message);
    }
    finally{setgoogleLoading(false)}
  };

  const onFacebookButtonPress = async () => {
    try {
      // Attempt login with permissions
      setfacebookLoading(true);
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        ToastAndroid.show("Login Cancelled.",ToastAndroid.SHORT);
      }

      // Get the access token
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        throw new Error('Something went wrong obtaining access token');
      }

      // Create a Firebase credential with the AccessToken
      const facebookCredential = auth.FacebookAuthProvider.credential(
        data.accessToken,
      );

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(
        facebookCredential,
      );
      setfacebookLoading(false);
      console.log('Facebook login successful:', userCredential.user);
      ToastAndroid.show('Facebook login successful', ToastAndroid.SHORT);
      setUserData(userCredential.user);
    } catch (error) {
      console.log('Facebook login error:', error);
      if (error.code === 'auth/account-exists-with-different-credential') {
        ToastAndroid.show(
          'This email is already registered with another login method. Please use that method to sign in.',
          ToastAndroid.LONG
        );
      }

      else if (error.message.includes('cancelled')) {
        ToastAndroid.show('Login cancelled', ToastAndroid.SHORT);
      }

      else {
        ToastAndroid.show('Login failed. Please try again.', ToastAndroid.SHORT);
      }
  
      setError(error.message);
    }
    finally{
      setfacebookLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      ToastAndroid.show('Please enter your email address', ToastAndroid.SHORT);
      return;
    }
  
    try {
      await auth().sendPasswordResetEmail(email);
      ToastAndroid.show('Password reset email sent! Check your inbox', ToastAndroid.SHORT);
    } catch (error) {
      console.log('Password reset error:', error);
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }
  };
  

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      await LoginManager.logOut();
      await auth().signOut();
      console.log('User signed out');
      ToastAndroid.show('Logged out successfully', ToastAndroid.SHORT);
      setUserData(null);
      setEmail(null);
      setPassword(null);
    } catch (error) {
      console.log('Logout error:', error);
      Alert.alert('Logout Error', error.message);
    }
  };

  // If user is already logged in, show their data
  if (userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Welcome, {userData.displayName || userData.email}!
        </Text>
        <Image
          source={{
            uri:
              userData.photoURL ||
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp3oYa9BljpcyhfIwVizBrEuo4HjsWq1mNzw&s',
          }}
          style={styles.profileImage}
        />
        <View style={styles.userDataContainer}>
          <Text style={styles.userDataText}>Email: {userData.email}</Text>
          {/* <Text style={styles.userDataText}>Provider: {userData.providerData[0].providerId}</Text> */}
          <Text ellipsizeMode="tail" style={styles.userDataText}>
            UID: {userData.uid}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show login screen if user is not logged in
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.innerContainer}>
        <View
          style={{borderRadius: 0, backgroundColor: '', borderRadius: '10%'}}>
          <LottieView
            source={require('../assets/animation/loginman.json')}
            style={{height: 210, width: 210, alignSelf: 'center'}}
            autoPlay
          />
        </View>
        <Text style={styles.title}>Login</Text>

        {/* {error ? <Text style={styles.error}>{error}</Text> : null} */}
        {loading && (
          <ActivityIndicator
            style={{
              position: 'absolute',
              width: 100,
              alignSelf: 'center',
              height: 100,
            }}
            size={'large'}
            color={'#ff8400'}
          />
        )}
        {googleloading && (
          <ActivityIndicator
            style={{
              position: 'absolute',
              width: 100,
              alignSelf: 'center',
              height: 100,
            }}
            size={'large'}
            color={'#ff8400'}
          />
        )}
        {facebookloading && (
          <ActivityIndicator
            style={{
              position: 'absolute',
              width: 100,
              alignSelf: 'center',
              height: 100,
            }}
            size={'large'}
            color={'#ff8400'}
          />
        )}


        <View style={styles.inputContainer}>
          <Image
            source={{uri: 'https://cdn-icons-png.flaticon.com/128/482/482138.png'}}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onSubmitEditing={() => passwordRef.current.focus()}
            returnKeyType="next"
            submitBehavior="submit"
            maxLength={40}
          />
        </View>

        <View style={styles.inputContainer}>
          <Image
            source={{uri: 'https://cdn-icons-png.flaticon.com/128/13645/13645760.png'}}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            submitBehavior="blurAndSubmit"
            maxLength={12}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}>
            <Image source={{uri:'https://cdn-icons-png.flaticon.com/128/2965/2965306.png'}} style={ styles.buttonIcon}/>
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login with Email'}
          </Text>
        </TouchableOpacity>

        {/* Google Login Button */}
        <TouchableOpacity
          style={[styles.facebookButton, loading && styles.buttonDisabled]}
          onPress={onGoogleButtonPress}
          disabled={loading}>
             <Image source={{uri:'https://cdn-icons-png.flaticon.com/128/720/720255.png'}} style={ styles.buttonIcon}/>
          <Text style={styles.facebookButtonText}>Login with Google</Text>
        </TouchableOpacity>

        {/* Facebook Login Button */}
        <TouchableOpacity
          style={[styles.facebookButton, loading && styles.buttonDisabled]}
          onPress={onFacebookButtonPress}
          disabled={loading}>
             <Image source={{uri:'https://cdn-icons-png.flaticon.com/128/5968/5968764.png'}} style={ styles.buttonIcon}/>
          <Text style={styles.facebookButtonText}>Login with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => navigation.replace('SignupScreen')}>
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
  style={styles.forgotPasswordLink}
  onPress={handleForgotPassword}
>
  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
</TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 30,
    backgroundColor: 'grey',
    borderRadius: 50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 25,
  },
  inputIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#555',
    marginLeft:10
  },
  input: {
    flex: 1,
    height: 40,
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ff8400',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  googleButton: {
    width: '100%',
    height: 48,
    marginTop: 20,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    marginLeft:10,
  },
  facebookButton: {
    backgroundColor: '#ff8400',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  facebookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 30,
    alignSelf: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupBold: {
    fontWeight: 'bold',
    color: '#4285F4',
  },
  error: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  userDataContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  userDataText: {
    fontSize: 16,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordLink: {
    marginTop: 15,
    alignSelf:'center'
  },
  forgotPasswordText: {
    color: '#4285F4',
    fontSize: 14,
  },
  verificationNotice: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  verificationText: {
    color: '#E65100',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  resendLink: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default FirebaseLoginScreen;
