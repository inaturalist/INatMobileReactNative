import { ScrollView, View } from "components/styledComponents";
import React, { useEffect, useState } from "react";
import { Image } from "react-native";

import PhotoSlide from "./PhotoSlide";
import SoundSlide from "./SoundSlide";

const numColumns = 2;
const spacing = 6;

// A helper function to get the image dimensions
const getImageDimensions = async uri => new Promise( resolve => {
  Image.getSize( uri, ( width, height ) => {
    resolve( { width, height } );
  } );
} );

const photoUrl = photo => ( photo?.url
  ? photo.url.replace( "square", "large" )
  : photo.localFilePath );

const MasonryLayout = ( { items, onImagePress } ) => {
  const [columns, setColumns] = useState(
    Array.from( { length: numColumns }, () => [] )
  );

  useEffect( () => {
    const distributeItems = async () => {
      const newColumns = Array.from( { length: numColumns }, () => [] );

      const itemPromises = items.map( async item => {
        // If a sound, just return it
        if ( item.file_url ) {
          return item;
        }
        const imageDimensions = await getImageDimensions( photoUrl( item ) );
        return { ...item, ...imageDimensions };
      } );

      const itemData = await Promise.all( itemPromises );

      itemData.forEach( ( item, i ) => {
        const columnIndex = i % numColumns;
        item.originalIndex = i;
        newColumns[columnIndex].push( item );
      } );

      setColumns( newColumns );
    };

    distributeItems();
  }, [items] );

  const imageStyle = item => ( {
    width: "100%",
    height: undefined,
    aspectRatio: item.width / item.height,
    marginBottom: spacing
  } );

  const renderImage = ( item, index, column ) => (
    <PhotoSlide
      key={`MasonryLayout.column${column}.photo_${index}`}
      photo={item}
      style={imageStyle( item )}
      onPress={() => onImagePress( item.originalIndex )}
    />
  );

  const renderSound = ( item, index, column ) => (
    <SoundSlide
      key={`MasonryLayout.column${column}.sound_${index}`}
      sizeClass="w-full aspect-square"
      sound={item}
      isVisible
    />
  );

  const renderItem = ( item, index, column ) => ( item.file_url
    ? renderSound( item, index, column )
    : renderImage( item, index, column ) );

  return (
    <ScrollView>
      <View className="flex-row">
        <View className="flex-col flex-1">
          {columns[0].map( ( item, index ) => renderItem( item, index, 1 ) )}
        </View>
        <View className="w-[6px]" />
        <View className="flex-col flex-1">
          {columns[1].map( ( item, index ) => renderItem( item, index, 2 ) )}
        </View>
      </View>
    </ScrollView>
  );
};

export default MasonryLayout;
