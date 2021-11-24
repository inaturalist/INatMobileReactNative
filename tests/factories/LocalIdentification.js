import { define } from "factoria";

export default define( "LocalIdentification", faker => ( {
  uuid: faker.datatype.number( ),
  createdAt: "2017-09-09T08:28:05-08:00",
  body: faker.lorem.sentence( )
} ) );
