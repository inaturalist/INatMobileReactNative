import { screen } from "@testing-library/react-native";
import FilterModal from "components/Explore/Modals/FilterModal";
import { ExploreProvider } from "providers/ExploreContext.tsx";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const mockCloseModal = jest.fn( );
const mockUpdateTaxon = jest.fn( );

describe( "FilterModal", () => {
  test( "should not have accessibility errors", async () => {
    renderComponent(
      <ExploreProvider>
        <FilterModal
          closeModal={mockCloseModal}
          updateTaxon={mockUpdateTaxon}
        />
      </ExploreProvider>
    );

    const filterModal = await screen.findByTestId( "filter-modal" );
    expect( filterModal ).toBeAccessible();
  } );
} );
