import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Modal, PermissionsAndroid} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Geolocation from '@react-native-community/geolocation';
import '../../global.css';

interface Restroom {
  id: number;
  name: string;
  street: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  comment?: string;
  directions?: string;
  unisex?: boolean;
  ada?: boolean;
  changing_table?: boolean;
  distance?: number;
}

const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Geolocation Permission',
        message: 'Can we access your location?',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    console.log('Permission:', granted);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Permission error:', err);
    return false;
  }
};

export default function ListView() {
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      const permissionGranted = await requestLocationPermission();
      setHasPermission(permissionGranted);

      if (permissionGranted) {
        Geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            console.log('Device Location:', latitude, longitude);
            fetchRestrooms(latitude, longitude);
          },
          error => {
            console.error('Location Error:', error.code, error.message);
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      } else {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const fetchRestrooms = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://www.refugerestrooms.org/api/v1/restrooms/by_location?page=1&per_page=20&ada=false&unisex=false&lat=${lat}&lng=${lng}`,
      );
      const data = await response.json();
      setRestrooms(data);
    } catch (error) {
      console.error('Error fetching restrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4B5563" />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ textAlign: 'center', fontSize: 18 }}>
          Location permission denied. Please enable it in your settings to
          proceed.
        </Text>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    card: {
      backgroundColor: 'white',
      padding: 15,
      marginBottom: 10,
      borderRadius: 10,
      elevation: 5,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    cardDescription: {
      fontSize: 14,
      color: 'gray',
      marginTop: 5,
    },
    button: {
      backgroundColor: '#4B5563',
      padding: 10,
      borderRadius: 5,
      marginTop: 5,
      alignItems: 'center',
    },
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        {restrooms.map((restroom) => (
          <TouchableOpacity
            key={restroom.id}
            style={styles.card}
            onPress={() => {
              setSelectedRestroom(restroom);
              setModalVisible(true);
            }}
          >
            <Text style={styles.cardTitle}>{restroom.name}</Text>
            <Text style={styles.cardDescription}>
              {restroom.comment ? restroom.comment : 'No comment'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            {selectedRestroom && (
              <>
                <Text style={styles.modalText}>
                  Unisex: {selectedRestroom.unisex ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.modalText}>
                  ADA: {selectedRestroom.ada ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.modalText}>
                  Changing Table: {selectedRestroom.changing_table ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.modalText}>
                  Distance: {selectedRestroom.distance} km
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: 'white' }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
