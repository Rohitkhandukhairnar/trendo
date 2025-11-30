import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

const PrivacyPolicyScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We collect personal information that you voluntarily provide to us when you register on the app, 
          express an interest in obtaining information about us or our products and services, or otherwise 
          when you contact us.
        </Text>
        
        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          We use personal information collected via our app for a variety of business purposes described below. 
          We process your personal information for these purposes in reliance on our legitimate business interests.
        </Text>
        
        <Text style={styles.sectionTitle}>3. Sharing Your Information</Text>
        <Text style={styles.text}>
          We only share information with your consent, to comply with laws, to provide you with services, 
          to protect your rights, or to fulfill business obligations.
        </Text>
        
        <Text style={styles.sectionTitle}>4. Security of Your Information</Text>
        <Text style={styles.text}>
          We use administrative, technical, and physical security measures to help protect your personal information. 
          However, please remember that no transmission of data over the Internet or any wireless network can be 
          guaranteed to be 100% secure.
        </Text>
        
        <Text style={styles.sectionTitle}>5. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update this Privacy Policy from time to time. The updated version will be indicated by an updated 
          "Revised" date and the updated version will be effective as soon as it is accessible.
        </Text>
        
        <Text style={styles.lastUpdated}>Last updated: June 2023</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  content: {
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default PrivacyPolicyScreen;