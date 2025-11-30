import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth().currentUser;
      const credential = auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      
      // Reauthenticate user
      await user.reauthenticateWithCredential(credential);
      
      // Change password
      await user.updatePassword(newPassword);
      
      ToastAndroid.show('Password changed successfully!', ToastAndroid.SHORT);
      navigation.goBack();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TextInput
        style={styles.input}
        placeholder="Current Password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholderTextColor={''}
      />
      
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Change Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ff8400',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default ChangePasswordScreen;
