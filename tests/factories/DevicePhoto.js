import { define } from "factoria";

export default define( "DevicePhoto", faker => ( {
  location: {
    latitude: Number( faker.address.latitude( ) ),
    longitude: Number( faker.address.longitude( ) )
  },
  timestamp: faker.time.recent( ),
  uri: faker.image.imageUrl( )
} ) );
