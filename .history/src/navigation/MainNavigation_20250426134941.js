import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import FeedScreen from '../screens/FeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import AboutUsScreen from '../screens/AboutUsScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigation() {
  return (
      <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{headerShown:false}} >
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="FeedScreen" component={FeedScreen} />

        <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} 
        options={{ title: 'Change Password' }} />
      <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} 
        options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} 
        options={{ title: 'About Us' }} />

      </Stack.Navigator>
  );
}
