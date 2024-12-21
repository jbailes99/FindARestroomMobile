import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  PermissionsAndroid,
  TouchableOpacity,
  Modal,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
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

export default function App() {
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const mapViewRef = useRef<MapView | null>(null);

  useEffect(() => {
    const initApp = async () => {
      const permissionGranted = await requestLocationPermission();
      setHasPermission(permissionGranted);

      if (permissionGranted) {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            console.log('Device Location:', latitude, longitude);
            setRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });

            fetchRestrooms(latitude, longitude);
          },
          error => {
            console.error('Location Error:', error.code, error.message);
            setLoading(false);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
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
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#4B5563" />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{textAlign: 'center', fontSize: 18}}>
          Location permission denied. Please enable it in your settings to
          proceed.
        </Text>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    customView: {
      position: 'absolute',
      bottom: 100,
      left: 10,
      right: 10,
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 5,
      elevation: 5,
    },
    button: {
      backgroundColor: '#4B5563',
      padding: 10,
      borderRadius: 5,
      marginTop: 5,
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
      <MapView
        ref={mapViewRef}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={() => setSelectedRestroom(null)}>
        {restrooms.map(restroom => (
          <Marker
            key={restroom.id}
            coordinate={{
              latitude: restroom.latitude,
              longitude: restroom.longitude,
            }}
            title={restroom.name}
            description={restroom.comment ? restroom.comment : 'No comment'}
            image={require('../assets/toilet.png')}
            onPress={() => {
              setSelectedRestroom(restroom);
              const newRegion = {
                latitude: restroom.latitude,
                longitude: restroom.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              };
              mapViewRef.current?.animateToRegion(newRegion, 1000); // Animate without setting region state
            }}
          />
        ))}
      </MapView>
      {selectedRestroom && (
        <View style={styles.customView}>
          <Text>{selectedRestroom.name}</Text>
          <Text>
            {selectedRestroom.comment ? selectedRestroom.comment : 'No comment'}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}>
            <Text style={{color: 'yellow'}}>More Info</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* <Text style={{position: 'absolute', top: 10, left: 10}}>
        Current latitude: {region.latitude}
      </Text>
      <Text style={{position: 'absolute', top: 30, left: 10}}>
        Current longitude: {region.longitude}
      </Text> */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
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
                  Changing Table:{' '}
                  {selectedRestroom.changing_table ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.modalText}>
                  Distance: {selectedRestroom.distance} km
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setModalVisible(false)}>
                  <Text style={{color: 'white', textAlign: 'center'}}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
