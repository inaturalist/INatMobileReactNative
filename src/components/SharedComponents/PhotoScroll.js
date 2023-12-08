// @flow

import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { Dimensions } from "react-native";
import AnimatedDotsCarousel from "react-native-animated-dots-carousel";
import Carousel from "react-native-reanimated-carousel";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  onPress: ?Function,
  photos: Array<Object>
}

const PhotoScroll = ( {
  onPress,
  photos
}: Props ): Node => {
  const { width } = Dimensions.get( "window" );
  const [index, setIndex] = useState<number>( 0 );
  const { t } = useTranslation( );
  const paginationColor = colors.white;

  const CarouselImage = useCallback( ( { item: photo } ) => {
    // check for local file path for unuploaded photos
    const photoUrl = photo?.url
      ? photo.url.replace( "square", "large" )
      : photo.localFilePath;

    const image = (
      <Image
        testID="PhotoScroll.photo"
        source={{ uri: photoUrl }}
        className="h-72 w-screen"
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    );
    if ( !onPress ) {
      return image;
    }
    return (
      <Pressable
        onPress={
          pressEvent => onPress( pressEvent, { uri: photo.url || photo.localFilePath } )
        }
        accessibilityRole="link"
        accessibilityHint={t( "View-photo" )}
      >
        {image}
      </Pressable>
    );
  }, [onPress, t] );

  return (
    <View className="relative">
      <Carousel
        testID="photo-scroll"
        loop={false}
        horizontal
        width={width}
        height={288}
        scrollAnimationDuration={100}
        data={photos}
        renderItem={CarouselImage}
        pagingEnabled
        onProgressChange={( _, absoluteProgress ) => {
          setIndex( Math.round( absoluteProgress ) );
        }}
      />
      {photos.length > 1 && (
        <View
          className="flex absolute bottom-0 w-full justify-evenly items-center p-[15px]"
        >
          <AnimatedDotsCarousel
            length={photos.length}
            currentIndex={index}
            maxIndicators={photos.length}
            interpolateOpacityAndColor={false}
            activeIndicatorConfig={{
              color: paginationColor,
              margin: 2.5,
              opacity: 1,
              size: 4
            }}
            inactiveIndicatorConfig={{
              color: paginationColor,
              margin: 2.5,
              opacity: 1,
              size: 2
            }}
            // required by the component although we don't need it.
            // Size of decreasing dots set to the same
            decreasingDots={[
              {
                config: {
                  color: paginationColor, margin: 3, opacity: 0.5, size: 4
                },
                quantity: 1
              },
              {
                config: {
                  color: paginationColor, margin: 3, opacity: 0.5, size: 2
                },
                quantity: 1
              }
            ]}
          />
        </View>
      )}
    </View>

  );
};

export default PhotoScroll;
