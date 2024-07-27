import {
  refresh as refreshNetInfo,
  useNetInfo
} from "@react-native-community/netinfo";
import Slider from "@react-native-community/slider";
import { useFocusEffect } from "@react-navigation/native";
import { Body1, INatIconButton, OfflineNotice } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import { useTheme } from "react-native-paper";
import { log } from "sharedHelpers/logger";
import { useTranslation } from "sharedHooks";

const logger = log.extend( "SoundContainer" );

const SoundSlider = ( { playBackState, onSlidingComplete } ) => {
  const theme = useTheme( );
  const sliderStyle = {
    width: "100%"
  };
  return (
    <Slider
      style={sliderStyle}
      minimumValue={0}
      maximumValue={playBackState.duration}
      minimumTrackTintColor="#FFFFFF"
      maximumTrackTintColor="#FFFFFF"
      thumbTintColor={theme.colors.inatGreen}
      tapToSeek
      value={playBackState.currentPosition}
      onSlidingComplete={onSlidingComplete}
    />
  );
};

const SoundContainer = ( {
  autoPlay,
  isVisible,
  sizeClass,
  sound
} ) => {
  const needsInternet = sound.file_url.includes( "https://" );
  const { isConnected } = useNetInfo( );
  const playerRef = useRef( new AudioRecorderPlayer( ) );
  const player = playerRef.current;
  const { t } = useTranslation( );
  // Track whether or not the sound is playing
  const [playing, setPlaying] = useState( false );

  // Track whether the user swiped away since last playing
  const [swipedAway, setSwipedAway] = useState( false );

  // Current progress and total duration of playback
  const [playBackState, setPlayBackState] = useState( {
    // Current position of playback in milliseconds
    currentPosition: 0,
    // Total duration of audio in milliseconds
    duration: 0,
    formattedCurrentPosition: "00:00",
    formattedDuration: "00:00"
  } );

  const mmss = useCallback( ( value: number ) => player.mmss(
    Math.floor( value / 1000 )
  ), [player] );

  const playSound = useCallback( position => {
    async function playSoundAsync( ) {
      await player.startPlayer( sound.file_url );
      if ( position ) {
        await player.seekToPlayer( position );
      }
      player.addPlayBackListener( playBackEvent => {
        setPlayBackState( {
          currentPosition: playBackEvent.currentPosition,
          duration: playBackEvent.duration,
          formattedCurrentPosition: mmss( playBackEvent.currentPosition ),
          formattedDuration: mmss( playBackEvent.duration )
        } );
        // Update UI when playback is complete
        if ( playBackEvent.currentPosition >= playBackEvent.duration ) {
          setPlaying( false );
        }
      } );
    }
    setSwipedAway( false );
    setPlaying( true );
    playSoundAsync( );
    return ( ) => {
      player.removePlayBackListener( );
    };
  }, [
    player,
    sound.file_url,
    mmss
  ] );

  const stopSound = useCallback( async ( ) => {
    setPlaying( false );
    setSwipedAway( !isVisible );
    try {
      await player.pausePlayer( );
    } catch ( pausePlayerError ) {
      if ( pausePlayerError.message.match( /Player has already stopped/ ) ) {
        // Something else might be wrong, but it's not really something to
        // bother the user with
        logger.error( "[SoundContainer.js] Error pausing player: ", pausePlayerError );
        return;
      }
      throw pausePlayerError;
    }
    player.removePlayBackListener( );
  }, [
    isVisible,
    player
  ] );

  // Tapping the button can play, pause, or resume
  const togglePlay = useCallback( ( ) => {
    if ( playing ) {
      stopSound( );
    } else if (
      playBackState.currentPosition > 0
      && playBackState.currentPosition < playBackState.duration
    ) {
      // player.resumePlayer() doesn't work if another sound was played after
      // this one was paused, so if we swiped away, we re-init the player and
      // seek to the previous position
      if ( swipedAway ) {
        playSound( playBackState.currentPosition );
      } else {
        // If we haven't swiped away, we can use resumePlayer, which also
        // seems to not cause the progress to jump back to 0 and then to the
        // current position
        setPlaying( true );
        player.resumePlayer( );
      }
    } else {
      playSound( );
    }
  }, [
    playBackState.currentPosition,
    playBackState.duration,
    player,
    playing,
    playSound,
    swipedAway,
    stopSound
  ] );

  // If the sound is no longer visible in the carousel (i.e. user swiped to a
  // different media item), stop playback
  useEffect( ( ) => {
    if ( !isVisible ) {
      stopSound( );
    }
  }, [
    isVisible,
    playBackState,
    sound,
    stopSound
  ] );

  // User navigated to a different screen, stop playback. Note that this is
  // only using the cleanup function of useCallback
  useFocusEffect( useCallback( ( ) => async ( ) => {
    await stopSound( );
  }, [stopSound] ) );

  // if autoPlay was selected and this is visible, start playback automatically
  useEffect( ( ) => {
    if ( isVisible && autoPlay ) {
      playSound( );
    }
  }, [autoPlay, isVisible, playSound] );

  if ( isConnected === false && needsInternet ) {
    return (
      <OfflineNotice
        onPress={( ) => refreshNetInfo( )}
        color="white"
      />
    );
  }
  return (
    <View className={`${sizeClass} items-center justify-center`}>
      <INatIconButton
        className="mx-auto"
        icon={
          playing
            ? "pause-circle"
            : "play-circle"
        }
        onPress={togglePlay}
        mode="contained"
        color="white"
        accessibilityLabel="Play"
        width={82}
        height={82}
        size={80}
      />
      <View className="flex-row mt-[30px] mb-2">
        <View className="text-white w-full items-end">
          <Body1 className="text-white text-end">
            {playBackState.formattedCurrentPosition}
          </Body1>
        </View>
        <Body1 className="text-white mx-1 self-center">{ t( "sound-playback-separator" ) }</Body1>
        <Body1 className="text-white w-full items-start">
          {playBackState.formattedDuration}
        </Body1>
      </View>
      <View className="relative w-3/4 h-4 justify-center">
        <SoundSlider
          playBackState={playBackState}
          onSlidingComplete={value => {
            setPlayBackState( {
              ...playBackState,
              currentPosition: value,
              formattedCurrentPosition: mmss( value )
            } );
            player.seekToPlayer( value );
          }}
        />
      </View>
    </View>
  );
};

export default SoundContainer;
