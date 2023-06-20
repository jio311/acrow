import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Dimensions, TouchableOpacity, Text, TextInput, Linking } from 'react-native';
import Swiper from 'react-native-swiper';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { map, KakaoNavi, KakaoLink, isKakaoNaviInstalled, initialize } from 'react-native-kakao-links';

const images = [
  require('./preview1.png'),
  require('./preview2.png'),
  require('./preview3.png'),
  require('./preview4.png'),
];

const HomeScreen = ({ navigation }) => {
  const handleStart = () => {
    navigation.navigate('NewScreen');
  };

  return (
    <View style={styles.container}>
      <Swiper
        showsButtons={false}
        loop={false}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      >
        {images.map((image, index) => (
          <View style={styles.slide} key={index}>
            <Image source={image} style={styles.image} resizeMode="cover" />
            {index === images.length - 1 && (
              <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </Swiper>
    </View>
  );
};

const NewScreen = () => {
  const navigation = useNavigation();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [markers, setMarkers] = useState([]);
  const [polylineCoordinates, setPolylineCoordinates] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    if (origin !== '' && destination !== '') {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [origin, destination]);

  const handleDirections = async () => {
    if (origin === '' || destination === '') {
      return;
    }

    try {
      const originCoordinates = await geocodeAddress(origin);
      const destinationCoordinates = await geocodeAddress(destination);

      const response = await fetch(
        `https://apis-navi.kakaomobility.com/v1/directions?origin=${originCoordinates.lat},${originCoordinates.lng}&destination=${destinationCoordinates.lat},${destinationCoordinates.lng}&waypoints=&priority=RECOMMEND&car_fuel=GASOLINE&car_hipass=false&alternatives=false&road_details=false`,
        {
          headers: {
            Authorization: `KakaoAK ${'0a15ffb31d55a80bae6f884b30f308ff'}`,
          },
        }
      );

      const data = await response.json();
      setMarkers(data.features);
      setPolylineCoordinates(data.coordinates);
      navigation.navigate('DirectionsScreen');
    } catch (error) {
      console.error('API 호출 오류:', error);
    }
  };

  const geocodeAddress = async (address) => {
    const apiKey = '0a15ffb31d55a80bae6f884b30f308ff'; // 카카오 지도 API 키를 입력해야 합니다.
  
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodedAddress}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      });
  
      const { documents } = response.data;
      if (documents.length > 0) {
        const { x: lng, y: lat } = documents[0].address;
        return { lat, lng };
      } else {
        throw new Error('Failed to geocode address');
      }
    } catch (error) {
      console.error('Failed to geocode address:', error);
      throw error;
    }
  };
  

  const initialRegion = {
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };
  const startKakaoNavi = () => {
    const lat = {}; // 도착지의 위도
    const lng = {}; // 도착지의 경도
    const kakaoMapUrl = `https://map.kakao.com/link/to/도착지,${lat},${lng}`;
    
    Linking.canOpenURL('kakaomap://').then((supported) => {
      if (supported) {
        Linking.openURL(`kakaomap://route?sp=${lat},${lng}&ep=${lat},${lng}&by=CAR`);
      } else {
        Linking.openURL(kakaoMapUrl);
      }
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        
        <TextInput
          style={styles.input}
          value={destination}
          onChangeText={(text) => setDestination(text)}
          placeholder="도착지 주소"
        />
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={startKakaoNavi}
          disabled={isButtonDisabled}
        >
          <Text style={styles.directionsButtonText}>길 안내</Text>
        </TouchableOpacity>
      </View>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {markers?.length > 0 &&
          markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={marker.title}
              description={marker.description}
            />
          ))}
        {polylineCoordinates?.length > 0 && (
          <Polyline
            coordinates={polylineCoordinates}
            strokeWidth={2}
            strokeColor="#FF8C00"
          />
        )}
      </MapView>
      <Text style={styles.newScreenText}>새 화면입니다!</Text>
    </View>
  );
};

const DirectionsScreen = () => {
  const navigation = useNavigation();
  const handleGoBack = () => {
    navigation.goBack();
  };

  const initialRegion = {
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  // const startKakaoNavi = () => {
  //   const lat = {}; // 도착지의 위도
  //   const lng = {}; // 도착지의 경도
  //   const kakaoMapUrl = `https://map.kakao.com/link/to/도착지,${lat},${lng}`;
    
  //   Linking.canOpenURL('kakaomap://').then((supported) => {
  //     if (supported) {
  //       Linking.openURL(`kakaomap://route?sp=${lat},${lng}&ep=${lat},${lng}&by=CAR`);
  //     } else {
  //       Linking.openURL(kakaoMapUrl);
  //     }
  //   });
  // };
  

  // useEffect(() => {
  //   initialize('0a15ffb31d55a80bae6f884b30f308ff');
  // }, []);
  

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {/* ... */}
      </MapView>
      <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
        <Text style={styles.goBackButtonText}>뒤로 가기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.startNaviButton} onPress={startKakaoNavi}>
        <Text style={styles.startNaviButtonText}>카카오내비로 길 안내</Text>
      </TouchableOpacity>
    </View>
  );
};

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" headerMode="none">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NewScreen" component={NewScreen} />
        <Stack.Screen name="DirectionsScreen" component={DirectionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
    marginTop: 30,
    padding: 20,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  startButton: {
    position: 'absolute',
    bottom: 200,
    backgroundColor: '#FF8C00',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 2,
  },
  startButtonText: {
    color: 'white',
    fontFamily: 'System',
    fontSize: 18,
  },
  dot: {
    backgroundColor: '#D3D3D3',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: '#c9b29b',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  map: {
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  directionsButton: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 2,
    marginBottom: 10,
  },
  directionsButtonText: {
    color: 'white',
    fontFamily: 'System',
    fontSize: 18,
    textAlign: 'center',
  },
  newScreenText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  goBackButton: {
    position: 'absolute',
    marginTop: 20,
    top: 20,
    left: 20,
    backgroundColor: '#FF8C00',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 2,
  },
  goBackButtonText: {
    color: 'white',
    fontFamily: 'System',
    fontSize: 14,
  },
});
