import React from 'react';
import {View, Text, ScrollView, StyleSheet, Image, Linking, TouchableOpacity} from 'react-native';

const AboutUsScreen = () => {
  const openWebsite = url => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          }}
          style={styles.logo}
        />
        <Text style={styles.title}>About Our App</Text>

        <Text style={styles.text}>
          Welcome to our social app! We're dedicated to providing you with the
          best experience, with a focus on simplicity, security, and great
          features.
        </Text>

        <Text style={styles.sectionTitle}>Our Team</Text>
        <Text style={styles.text}>
          We're a small team of passionate developers working to create
          meaningful connections through technology.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.text}>
          Have questions or suggestions? We'd love to hear from you!
        </Text>

        <TouchableOpacity
          onPress={() => openWebsite('mailto:support@example.com')}>
          <Text style={styles.link}>Email: rohitkhairnar405@gmail.com</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openWebsite('https://example.com')}>
          <Text style={styles.link}>Website: example.com</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
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
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  link: {
    fontSize: 16,
    color: '#4285F4',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginTop: 30,
    fontStyle: 'italic',
  },
});

export default AboutUsScreen;
