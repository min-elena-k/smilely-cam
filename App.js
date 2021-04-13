import React, { Component } from 'react';
import { ActivityIndicator, Dimensions, Platform, TouchableHighlightBase, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import styled from "styled-components";
import { MaterialIcons } from "@expo/vector-icons";
import * as FaceDetector from 'expo-face-detector';
import * as Permissions from "expo-permissions";
import { addAssetsToAlbumAsync, createAlbumAsync, createAssetAsync, getAlbumAsync } from 'expo-media-library';

const { width, height } = Dimensions.get("window");

const ALBUM_NAME = "Smiley Cam";

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


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasPermission: null,
      cameraType: Camera.Constants.Type.front,
      smileDetected: false
    };
    this.cameraRef = React.createRef();
  }
  
  componentDidMount = async () => {
    const { status } = await Camera.requestPermissionsAsync();
    this.setState({ hasPermission: status === 'granted' });
  }

  switchCameraType = () => {
    return cameraType === Camera.Constants.Type.front ?
      setCameraType(Camera.Constants.Type.back)
      : setCameraType(Camera.Constants.Type.front)
  }

  takePhoto = async () => {
    console.log("takePhoto")
    // console.log(this.cameraRef.current)

    try {
      if (this.cameraRef.current) {
        let { uri } = await this.cameraRef.current.takePictureAsync({
          quality: 1
        });
  
        if (uri) {
          this.savePhoto(uri)
        }
      }
    } catch(error) {
        alert(error);
        this.setState({ smileDetected: false });
    }
  }

  savePhoto = async (uri) => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === 'granted') {
        const asset = await createAssetAsync(uri);
        let album = await getAlbumAsync(ALBUM_NAME);
        console.log(album)
        if (album === null) {
          album = await createAlbumAsync(ALBUM_NAME,
              Platform.OS !== "ios" ? asset : null,
              true
            );

            await addAssetsToAlbumAsync([asset], album.id);
        } else {
          await addAssetsToAlbumAsync([asset], album.id);
        }
        setTimeout(
          () => {
            this.setState({ smileDetected: false })
          }
        )
      } else {
        this.setState({ hasPermission: false })
      }

    } catch (error) {
      console.log("error")
      console.log(error);
    }
  }

  onFaceDetected = ({faces}) => {
    const face = faces[0];

    if (face) {
      // console.log("smile~~~", face.smilingProbability);
      if (face.smilingProbability > 0.7) {
        this.setState({ smileDetected: true });
        this.takePhoto();
      }
    }
  }

  render() {
    const { hasPermission, cameraType, smileDetected } = this.state;

    if (hasPermission) {
      return (
        <CenterView>
          <Camera 
            ratio={"1:1"}
            style={{ 
              width: width - 40 ,
              height: width - 40,
              borderRadius: 40,
              overflow: "hidden",
            }}
            type={cameraType}
            onFacesDetected={smileDetected ? null : this.onFaceDetected}
            faceDetectorSettings={{
              detectLandmarks: FaceDetector.Constants.Landmarks.all,
              runClassifications: FaceDetector.Constants.Classifications.all,
            }}
            ref={this.cameraRef}
          />
          <IconBar>
            <TouchableOpacity onPress={this.switchCameraType}>
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
}

export default App;