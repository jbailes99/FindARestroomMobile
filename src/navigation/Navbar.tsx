import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';

const Navbar = () => {
  return (
    <View style={styles.navbar}>
      <Image source={require('../assets/idk.png')} style={styles.icon} />
      <Text style={styles.title}>GottaGo</Text>
      <View style={styles.options}>
        <TouchableOpacity>
          <Text style={styles.option}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.option}>List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  icon: {
    width: 30,
    height: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  options: {
    flexDirection: 'row',
  },
  option: {
    marginHorizontal: 10,
    fontSize: 16,
  },
});

export default Navbar;
