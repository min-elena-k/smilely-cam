import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import styled from "styled-components";
import { MaterialIcons } from "@expo/vector-icons";
import * as FaceDetector from 'expo-face-detector';

const { width, height } = Dimensions.get("window");

const CenterView = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: cornflowerblue;
`;

const Text = styled.Text`
  color: white;
`;

const IconBar = styled.View`
  margin-top: 50px;
`;


export default function App() {
  const [hasPermission, setHasPermission] = React.useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [smileDetected, setSmileDetected] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      const ratios = await Camera.getSupportedRatiosAsync();
        console.log(ratios)
    })();
  }, []);

  const switchCameraType = () => {
    return cameraType === Camera.Constants.Type.front ?
      setCameraType(Camera.Constants.Type.back)
      : setCameraType(Camera.Constants.Type.front)
  }

  const onFaceDetected = ({faces}) => {
    const face = faces[0];

    if (face) {
      if (face.smilingProbability > 0.7) {
        setSmileDetected(true);
        console.log("take photo")
      }
    }
  }

  if (hasPermission) {
    return (
      <CenterView>
        <Camera 
          ratio={"1:1"}
          style={{ 
            width: width - 40 ,
            height: width - 40,
            // width, height,
            borderRadius: 40,
            overflow: "hidden",
          }}
          type={cameraType}
          onFacesDetected={smileDetected ? null : onFaceDetected}
          faceDetectorSettings={{
            detectLandmarks: FaceDetector.Constants.Landmarks.all,
            runClassifications: FaceDetector.Constants.Classifications.all,
          }}
        />
        <IconBar>
          <TouchableOpacity onPress={switchCameraType}>
              <MaterialIcons
                name={
                  cameraType === Camera.Constants.Type.front
                  ? "camera-rear"
                  : "camera-front"
                }
                color="white"
                size={50}
              />
          </TouchableOpacity>
        </IconBar>
      </CenterView>
    )
  } else if (!hasPermission) {
    return (
      <CenterView>
        <Text>Don't have permission for this</Text>
      </CenterView>
    )
  } else {
    return (
      <ActivityIndicator />
    )
  }
}
