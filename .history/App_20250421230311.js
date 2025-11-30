import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {NavigationContainer} from '@react-navigation/native';
import MainNavigation from './src/navigation/MainNavigation';

const App = () => {
  return (
    <NavigationContainer>
      <MainNavigation/>
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})