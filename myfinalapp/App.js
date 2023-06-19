import React, { useEffect, useState,useCallback,useRef } from 'react';
import { StyleSheet, View, Image, Dimensions, TouchableOpacity, Text, TextInput, Linking} from 'react-native';
import Swiper from 'react-native-swiper';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, { document,  Marker, Polyline } from 'react-native-maps';
import $ from "jquery";
// import WebView from 'react-native-webview';
<script src="https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=e8wHh2tya84M88aReEpXCa5XTQf3xgo01aZG39k5"></script>

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
  const mapRef = useRef(null);
  const [Directions, setDirections] = useState(null);

  useEffect(() => {
    const fetchDirections = () => {
      const options = {
        method: 'GET',
        headers: { accept: 'application/json', appKey: 'e8wHh2tya84M88aReEpXCa5XTQf3xgo01aZG39k5' }
      };
  
      fetch('https://apis.openapi.sk.com/tmap/geo/fullAddrGeo?addressFlag=F01&coordType=WGS84GEO&version=1&fullAddr=%EC%84%9C%EC%9A%B8%EC%8B%9C+%EA%B0%95%EB%82%A8%EA%B5%AC+%EC%8B%A0%EC%82%AC%EB%8F%99&page=1&count=20', options)
        .then(response => response.json())
        .then(data => {
          data
          console.log('성공!')
        })
        .catch(err => console.error(err));
    };
    fetchDirections();
  })
  
  const initTmap = useCallback((fetchDirections) => {
    // 1. 지도 띄우기
    map = new Tmapv2.Map(mapRef.current, {
    center: new Tmapv2.LatLng(37.56520450, 126.98702028),
    width: window.innerWidth + "px", // 모바일 앱의 전체 너비로 설정
    height: window.innerHeight + "px", // 모바일 앱의 전체 높이로 설정
    // zoom: 17,
    // zoomControl: true,
    // scrollwheel: true
    });
    window.addEventListener("resize", handleResize);


      // 마커 초기화
    const marker1 = new Tmapv2.Marker({
      icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
      iconSize: new Tmapv2.Size(24, 38),
      map: map
    });

    $("#btn_select").click(function() {
      // 2. API 사용요청
      var fullAddr = $("#fullAddr").val();
      var headers = {}; 
      headers["appKey"]="e8wHh2tya84M88aReEpXCa5XTQf3xgo01aZG39k5";
      $.ajax({
        method : "GET",
        headers : headers,
        url : "https://apis.openapi.sk.com/tmap/geo/fullAddrGeo?version=1&format=json&callback=result",
        async : false,
        data : {
          "coordType" : "WGS84GEO",
          "fullAddr" : fullAddr
        },
        success : function(response) {

          var resultInfo = response.coordinateInfo; // .coordinate[0];
          console.log(resultInfo);
          
          // 기존 마커 삭제
          marker1.setMap(null);
          
          // 3.마커 찍기
          // 검색 결과 정보가 없을 때 처리
          if (resultInfo.coordinate.length == 0) {
            $("#result").text(
            "요청 데이터가 올바르지 않습니다.");
          } else {
            var lon, lat;
            var resultCoordinate = resultInfo.coordinate[0];
            if (resultCoordinate.lon.length > 0) {
              // 구주소
              lon = resultCoordinate.lon;
              lat = resultCoordinate.lat;
            } else { 
              // 신주소
              lon = resultCoordinate.newLon;
              lat = resultCoordinate.newLat
            }
          
            var lonEntr, latEntr;
            
            if (resultCoordinate.lonEntr == undefined && resultCoordinate.newLonEntr == undefined) {
              lonEntr = 0;
              latEntr = 0;
            } else {
              if (resultCoordinate.lonEntr.length > 0) {
                lonEntr = resultCoordinate.lonEntr;
                latEntr = resultCoordinate.latEntr;
              } else {
                lonEntr = resultCoordinate.newLonEntr;
                latEntr = resultCoordinate.newLatEntr;
              }
            }
              
            var markerPosition = new Tmapv2.LatLng(Number(lat),Number(lon));    
            
            // 마커 올리기
            marker1 = new Tmapv2.Marker(
              {
                position : markerPosition,
                icon : "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
                iconSize : new Tmapv2.Size(
                24, 38),
                map : map
              }); 
            map.setCenter(markerPosition);
            
            // 검색 결과 표출
            var matchFlag, newMatchFlag;
            // 검색 결과 주소를 담을 변수
            var address = '', newAddress = '';
            var city, gu_gun, eup_myun, legalDong, adminDong, ri, bunji;
            var buildingName, buildingDong, newRoadName, newBuildingIndex, newBuildingName, newBuildingDong;
            
            // 새주소일 때 검색 결과 표출
            // 새주소인 경우 matchFlag가 아닌
            // newMatchFlag가 응답값으로
            // 온다
            if (resultCoordinate.newMatchFlag.length > 0) {
              // 새(도로명) 주소 좌표 매칭
              // 구분 코드
              newMatchFlag = resultCoordinate.newMatchFlag;
              
              // 시/도 명칭
              if (resultCoordinate.city_do.length > 0) {
                city = resultCoordinate.city_do;
                newAddress += city + "\n";
              }
              
              // 군/구 명칭
              if (resultCoordinate.gu_gun.length > 0) {
                gu_gun = resultCoordinate.gu_gun;
                newAddress += gu_gun + "\n";
              }
              
              // 읍면동 명칭
              if (resultCoordinate.eup_myun.length > 0) {
                eup_myun = resultCoordinate.eup_myun;
                newAddress += eup_myun + "\n";
              } else {
                // 출력 좌표에 해당하는
                // 법정동 명칭
                if (resultCoordinate.legalDong.length > 0) {
                  legalDong = resultCoordinate.legalDong;
                  newAddress += legalDong + "\n";
                }
                // 출력 좌표에 해당하는
                // 행정동 명칭
                if (resultCoordinate.adminDong.length > 0) {
                  adminDong = resultCoordinate.adminDong;
                  newAddress += adminDong + "\n";
                }
              }
              // 출력 좌표에 해당하는 리 명칭
              if (resultCoordinate.ri.length > 0) {
                ri = resultCoordinate.ri;
                newAddress += ri + "\n";
              }
              // 출력 좌표에 해당하는 지번 명칭
              if (resultCoordinate.bunji.length > 0) {
                bunji = resultCoordinate.bunji;
                newAddress += bunji + "\n";
              }
              // 새(도로명)주소 매칭을 한
              // 경우, 길 이름을 반환
              if (resultCoordinate.newRoadName.length > 0) {
                newRoadName = resultCoordinate.newRoadName;
                newAddress += newRoadName + "\n";
              }
              // 새(도로명)주소 매칭을 한
              // 경우, 건물 번호를 반환
              if (resultCoordinate.newBuildingIndex.length > 0) {
                newBuildingIndex = resultCoordinate.newBuildingIndex;
                newAddress += newBuildingIndex + "\n";
              }
              // 새(도로명)주소 매칭을 한
              // 경우, 건물 이름를 반환
              if (resultCoordinate.newBuildingName.length > 0) {
                newBuildingName = resultCoordinate.newBuildingName;
                newAddress += newBuildingName + "\n";
              }
              // 새주소 건물을 매칭한 경우
              // 새주소 건물 동을 반환
              if (resultCoordinate.newBuildingDong.length > 0) {
                newBuildingDong = resultCoordinate.newBuildingDong;
                newAddress += newBuildingDong + "\n";
              }
              // 검색 결과 표출
              if (lonEntr > 0) {
                var docs = "<a style='color:orange' href='#webservice/docs/fullTextGeocoding'>Docs</a>"
                var text = "검색결과(새주소) : " + newAddress + ",\n 응답코드:" + newMatchFlag + "(상세 코드 내역은 " + docs + " 에서 확인)" + "</br> 위경도좌표(중심점) : " + lat + ", " + lon + "</br>위경도좌표(입구점) : " + latEntr + ", " + lonEntr;
                $("#result").html(text);
              } else {
                var docs = "<a style='color:orange' href='#webservice/docs/fullTextGeocoding'>Docs</a>"
                var text = "검색결과(새주소) : " + newAddress + ",\n 응답코드:" + newMatchFlag + "(상세 코드 내역은 " + docs + " 에서 확인)" + "</br> 위경도좌표(입구점) : 위경도좌표(입구점)이 없습니다.";
                $("#result").html(text);
              }
            }
          }
        },
        error : function(request, status, error) {
          console.log(request);
          console.log("code:"+request.status + "\n message:" + request.responseText +"\n error:" + error);
          // 에러가 발생하면 맵을 초기화함
          // markerStartLayer.clearMarkers();
          // 마커초기화
          map.setCenter(new Tmapv2.LatLng(37.570028, 126.986072));
          $("#result").html("");
        
        }
      });
    });
  }, []);

  
  
    // fetchDirections();

  return (
    <View>
      <View ref={mapRef} style={{ width: "100%", height: "100vh" }}></View>
      <View style={{ flex: 1 }}></View>
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText}>선택</Text>
      </View>
      <TextInput placeholder="주소를 입력하세요" />
      <View></View>
    </View>
  );
  
};

const DirectionsScreen = () => {
  const navigation = useNavigation();
  const handleGoBack = () => {
    navigation.goBack();
  };

  const startTmapNavi = () => {
    const lat = 37.39279717586919; // 도착지의 위도
    const lng = 127.11205203011632; // 도착지의 경도
    Linking.openURL(`https://apis.openapi.sk.com/tmap/app/routes?appKey=jouBkCIN066GSPLa5jY5w4Dd6Kwvdprb4ntX7Y2W&name=도착지&lon=${lng}&lat=${lat}`);
  };

  const initialRegion = {
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {/* ... */}
      </MapView>
      <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
        <Text style={styles.goBackButtonText}>뒤로 가기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.startNaviButton} onPress={startTmapNavi}>
        <Text style={styles.startNaviButtonText}>길 안내 시작</Text>
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
}



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
  resultText: {
    fontSize: 16,
    marginBottom: 10,
  },
  mapWrap: {
    marginTop: 20,
    marginBottom: 20,
  },
  mapDiv: {
    width: '100%',
    height: 400,
  },
  mapActBtnWrap: {
    marginTop: 20,
  },
  buttonText: {
    marginTop: 50,
  },
});