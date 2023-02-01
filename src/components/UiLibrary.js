import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import Button from "components/SharedComponents/Buttons/Button";
import EvidenceButton from "components/SharedComponents/Buttons/EvidenceButton";
import SecondaryCTAButton from "components/SharedComponents/Buttons/SecondaryCTAButton";
import Body1 from "components/SharedComponents/Typography/Body1";
import Body2 from "components/SharedComponents/Typography/Body2";
import Body3 from "components/SharedComponents/Typography/Body3";
import Body4 from "components/SharedComponents/Typography/Body4";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import Heading2 from "components/SharedComponents/Typography/Heading2";
import Heading3 from "components/SharedComponents/Typography/Heading3";
import Heading4 from "components/SharedComponents/Typography/Heading4";
import List1 from "components/SharedComponents/Typography/List1";
import List2 from "components/SharedComponents/Typography/List2";
import Subheading1 from "components/SharedComponents/Typography/Subheading1";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import {
  ScrollView,
  View
} from "components/styledComponents";
import React from "react";
import { Alert } from "react-native";

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const UiLibrary = ( ) => (
  <ViewWithFooter>
    <ScrollView className="px-5">
      {/* TODO replace these text components with our typography header components */}
      <Body1>
        All the re-usable UI components we've got. If you're making a new UI
        component, please put it here first and try to show what it looks
        like with different property configurations.
      </Body1>
      <Heading1>Buttons</Heading1>
      <Heading2>Button</Heading2>
      <Button className="mb-2" level="primary" text="PRIMARY BUTTON" />
      <Button className="mb-2" text="NEUTRAL BUTTON" />
      <Button
        className="mb-2"
        level="focus"
        text="FOCUS BUTTON"
        onPress={( ) => Alert.alert(
          "You Tapped a Button",
          "Or did you click it? Fight me."
        )}
      />
      <Button className="mb-2" level="warning" text="WARNING BUTTON" />
      <Button className="mb-2" level="primary" text="PRIMARY DISABLED" disabled />
      <Button className="mb-2" text="NEUTRAL DISABLED" disabled />
      <Button className="mb-2" level="focus" text="FOCUS DISABLED" disabled />
      <Button className="mb-2" level="warning" text="WARNING DISABLED" disabled />
      <Button className="mb-2" loading text="LOADING BUTTON" />
      <Button
        className="mb-2"
        text="Tap to show alert"
        onPress={( ) => Alert.alert(
          "You Tapped a Button",
          "Or did you click it? Fight me."
        )}
      />

      <Heading2>Multiple Buttons With Focus</Heading2>
      <View className="flex-row justify-between">
        <Button className="my-2" text="LEFT" />
        <Button className="my-2 grow ml-3" level="focus" text="RIGHT" />
      </View>

      <Heading2>Multiple Buttons Without Focus</Heading2>
      <View className="flex-row">
        <Button className="my-2 grow" text="LEFT" />
        <Button className="my-2 ml-3 grow" text="RIGHT" />
      </View>

      <Heading2>AddObsButton</Heading2>
      <Body1 className="my-2">
        You probably don't want to tap this because you can't escape the
        modal. Probably need to refactor to separate form from function.
      </Body1>
      <AddObsButton />

      <Heading2 className="my-2">EvidenceButton</Heading2>
      <View className="flex flex-row justify-between">
        <View>
          <Body2>Default</Body2>
          <EvidenceButton />
        </View>
        <View>
          <Body2>Disabled</Body2>
          <EvidenceButton disabled />
        </View>
        <View>
          <Body2>With Icon</Body2>
          <EvidenceButton icon="photo-camera" />
        </View>
      </View>

      <Heading2 className="my-2">SecondaryCTAButton</Heading2>
      <SecondaryCTAButton>
        <Body1>SecondaryCTAButton</Body1>
      </SecondaryCTAButton>
      <SecondaryCTAButton disabled>
        <Body1>Disabled SecondaryCTAButton</Body1>
      </SecondaryCTAButton>

      <Heading2 className="my-2">Typography</Heading2>
      <Heading1 className="my-2">Heading1</Heading1>
      <Heading2 className="my-2">Heading2</Heading2>
      <Heading3 className="my-2">Heading3</Heading3>
      <Heading4 className="my-2">Heading4</Heading4>
      <Subheading1 className="my-2">Subheading1</Subheading1>
      <Body1 className="my-2">Body1</Body1>
      <Body2 className="my-2">Body2</Body2>
      <Body3 className="my-2">Body3</Body3>
      <Body4 className="my-2">Body4</Body4>
      <List1 className="my-2">List1</List1>
      <List2 className="my-2">List2</List2>

      <Heading2 className="my-2">More Stuff!</Heading2>
      <Body1 className="h-[400px]">
        Useless spacer at the end because height in NativeWind is confusing.
      </Body1>
    </ScrollView>
  </ViewWithFooter>
);

export default UiLibrary;
