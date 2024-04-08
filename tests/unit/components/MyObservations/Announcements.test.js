import { screen, waitFor } from "@testing-library/react-native";
import Announcements from "components/MyObservations/Announcements";
import inaturalistjs from "inaturalistjs";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const mockAnnouncement = {
  id: 1,
  body: "<p>This is a mobile announcement</p>",
  dismissible: false,
  start: "1971-01-01T00:00:00.000Z",
  end: "3021-01-31T00:00:00.000Z",
  placement: "mobile/home"
};

const mockDismissibleAnnouncement = {
  id: 2,
  body: "<p>This is a dismissible announcement</p>",
  dismissible: true,
  start: "1971-01-02T00:00:00.000Z",
  end: "3021-01-31T00:00:00.000Z",
  placement: "mobile/home"
};

jest.mock( "inaturalistjs", () => ( {
  __esModule: true,
  default: {
    announcements: {
      search: jest.fn( () => Promise.resolve( {} ) ),
      dismiss: jest.fn( () => Promise.resolve( {} ) )
    }
  }
} ) );

const mockUser = {
  id: 1,
  login: "user",
  locale: "en"
};

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => mockUser
} ) );

const containerID = "announcements-container";

describe( "Announcements", () => {
  beforeEach( ( ) => {
    inaturalistjs.announcements.search.mockReturnValue( Promise.resolve( {
      total_results: 0,
      results: []
    } ) );
  } );

  test( "should call inaturalistjs with locale as param", async () => {
    renderComponent( <Announcements isOnline /> );
    await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalledWith(
      expect.objectContaining( { locale: "en" } ),
      expect.anything()
    ) );
  } );

  test( "should not render without announcements", async () => {
    renderComponent( <Announcements isOnline /> );

    await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

    const container = screen.queryByTestId( containerID );
    expect( container ).toBeNull();
  } );

  describe( "with announcement", () => {
    beforeEach( ( ) => {
      inaturalistjs.announcements.search.mockReturnValue( Promise.resolve( {
        total_results: 1,
        results: [mockAnnouncement]
      } ) );
    } );

    test( "should render correctly", async () => {
      renderComponent( <Announcements isOnline /> );

      await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

      const container = await screen.findByTestId( containerID );
      expect( container ).toBeTruthy();
    } );

    test( "should show body text", async () => {
      renderComponent( <Announcements isOnline /> );

      await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

      const webview = await screen.findByTestId( "announcements-webview" );
      expect( webview ).toBeTruthy();
      expect( webview.props.source ).toStrictEqual( {
        html: mockAnnouncement.body
      } );
    } );

    test( "should not show dismiss button", async () => {
      renderComponent( <Announcements isOnline /> );

      await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

      const text = screen.queryByText( "DISMISS" );
      expect( text ).toBeNull();
    } );
  } );

  describe( "with dismissible announcement", () => {
    beforeEach( ( ) => {
      inaturalistjs.announcements.search.mockReturnValue( Promise.resolve( {
        total_results: 1,
        results: [mockDismissibleAnnouncement]
      } ) );
    } );

    test( "should show dismiss button", async () => {
      renderComponent( <Announcements isOnline /> );

      await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

      const button = await screen.findByText( "DISMISS" );
      expect( button ).toBeTruthy();
    } );
  } );

  describe( "with multiple announcements", () => {
    beforeEach( ( ) => {
      inaturalistjs.announcements.search.mockReturnValue( Promise.resolve( {
        total_results: 2,
        // Oldest last here
        results: [mockDismissibleAnnouncement, mockAnnouncement]
      } ) );
    } );

    test( "show announcement with oldest start date", async () => {
      renderComponent( <Announcements isOnline /> );

      await waitFor( () => expect( inaturalistjs.announcements.search ).toHaveBeenCalled() );

      // Test for oldest announcement
      const webview = await screen.findByTestId( "announcements-webview" );
      expect( webview ).toBeTruthy();
      expect( webview.props.source ).toStrictEqual( {
        html: mockAnnouncement.body
      } );
    } );
  } );
} );
