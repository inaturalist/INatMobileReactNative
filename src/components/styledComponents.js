// @flow

import { FasterImageView as UnstyledFasterImageView } from "@candlefinance/faster-image";
import {
  BottomSheetTextInput as StyledBottomSheetTextInput
} from "@gorhom/bottom-sheet";
import {
  tailwindFontBold,
  tailwindFontMedium,
  tailwindFontRegular
} from "constants/fontFamilies.ts";
import { styled } from "nativewind";
import {
  Image as UnstyledImage,
  ImageBackground as UnstyledImageBackground,
  KeyboardAvoidingView as UnstyledKeyboardAvoidingView,
  Modal as UnstyledModal,
  Platform,
  Pressable as StyledPressable,
  SafeAreaView as UnstyledSafeAreaView,
  ScrollView as UnstyledScrollView,
  Text as UnstyledText,
  TextInput as UntyledTextInput,
  View as UnstyledView
} from "react-native";
import UnstyledLinearGradient from "react-native-linear-gradient";

// $FlowIgnore
const View = styled( UnstyledView );
// $FlowIgnore
const KeyboardAvoidingView = styled( UnstyledKeyboardAvoidingView );
// Since upgrading to React Native 0.73 UnstyledSafeAreaView is undefined in the jest tests
// Why I don't know. This is just to fix the failing tests.
// $FlowIgnore
const SafeAreaView = styled( UnstyledSafeAreaView === undefined
  ? UnstyledView
  : UnstyledSafeAreaView );
// $FlowIgnore
const ScrollView = styled( UnstyledScrollView );
// $FlowIgnore
const Text = styled(
  UnstyledText,
  tailwindFontBold
);
// $FlowIgnore
const MediumText = styled(
  UnstyledText,
  tailwindFontMedium
);
// $FlowIgnore
const RegularText = styled(
  UnstyledText,
  tailwindFontRegular
);
// $FlowIgnore
const TextInput = styled( UntyledTextInput );
// $FlowIgnore
const Pressable = styled( StyledPressable );
// $FlowIgnore
const Image = styled( UnstyledImage );
// $FlowIgnore
const BottomSheetTextInput = styled( StyledBottomSheetTextInput );
// $FlowIgnore
const Modal = styled( UnstyledModal );
// $FlowIgnore
const ImageBackground = styled( UnstyledImageBackground );

const fontMonoClass: string = ( Platform.OS === "ios"
  ? "font-Menlo"
  : "font-monospace" );

// $FlowIgnore
const LinearGradient = styled( UnstyledLinearGradient );

// $FlowIgnore
const FasterImageView = styled( UnstyledFasterImageView );

export {
  BottomSheetTextInput,
  FasterImageView,
  fontMonoClass,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  LinearGradient,
  MediumText,
  Modal,
  Pressable,
  RegularText,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
};
