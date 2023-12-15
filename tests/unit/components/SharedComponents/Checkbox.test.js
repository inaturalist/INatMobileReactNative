import { fireEvent, render, screen } from "@testing-library/react-native";
import { Checkbox } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";
import colors from "styles/tailwindColors";

import { renderComponent } from "../../../helpers/render";

const rerenderCheckmarkComponent = checked => {
  renderComponent(
    <Checkbox
      text="Checkmark text"
      isChecked={checked}
    />
  );
  const checkbox = screen.getByLabelText( /Checkmark/ );
  expect( checkbox ).toHaveProp( "innerIconStyle", {
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.inatGreen
  } );
};

describe( "Checkbox", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "renders reliably", () => {
    render( <Checkbox text="Checkmark text" /> );

    expect( screen ).toMatchSnapshot( );
  } );

  it( "has no accessibility errors", () => {
    const checkbox = <Checkbox text="Checkmark text" isChecked />;

    expect( checkbox ).toBeAccessible();
  } );

  it( "renders an empty checkbox when isChecked is false", () => {
    renderComponent( <Checkbox text="Checkmark text" isChecked={false} /> );

    const checkmark = screen.getByLabelText( /Checkmark/ );

    expect( checkmark ).toBeTruthy( );
    expect( checkmark ).toHaveProp( "innerIconStyle", {
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.darkGray
    } );
  } );

  it( "renders a green filled checkbox when isChecked is true", () => {
    renderComponent( <Checkbox text="Checkmark text" isChecked /> );

    const checkmark = screen.getByLabelText( /Checkmark/ );
    expect( checkmark ).toHaveProp( "innerIconStyle", {
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.inatGreen
    } );
  } );

  it( "changes value when user presses checkbox", () => {
    let checked = false;
    renderComponent(
      <Checkbox
        text="Checkmark text"
        isChecked={checked}
        // eslint-disable-next-line no-return-assign
        onPress={( ) => ( checked = !checked )}
      />
    );
    const checkmark = screen.getByLabelText( /Checkmark/ );

    expect( checked ).toBeFalsy( );
    fireEvent.press( checkmark );
    expect( checked ).toBeTruthy( );
    rerenderCheckmarkComponent( checked );
  } );

  it( "renders text and changes value when user presses text", () => {
    let checked = false;
    renderComponent(
      <Checkbox
        text="Checkmark text"
        isChecked={checked}
        // eslint-disable-next-line no-return-assign
        onPress={( ) => ( checked = !checked )}
      />
    );

    const text = screen.getByText( /Checkmark text/ );
    expect( text ).toBeVisible( );
    expect( checked ).toBeFalsy( );
    fireEvent.press( text );
    expect( checked ).toBeTruthy( );
    rerenderCheckmarkComponent( checked );
  } );
} );
