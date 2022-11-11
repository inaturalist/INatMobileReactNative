import MarkdownIt from "markdown-it";
import * as React from "react";
import {
  useWindowDimensions,
  View
} from "react-native";
import HTML from "react-native-render-html";
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = ( `
  a
  abbr
  acronym
  b
  blockquote
  br
  cite
  code
  del
  div
  dl
  dt
  em
  h1
  h2
  h3
  h4
  h5
  h6
  hr
  i
  img
  ins
  li
  ol
  p
  pre
  s
  small
  strike
  strong
  sub
  sup
  table
  tbody
  td
  t
  th
  thead
  tr
  tt
  ul
` ).split( /\s+/m ).filter( e => e !== "" );

const ALLOWED_ATTRIBUTES_NAMES = (
  "href src width height alt cite title class name abbr value align target rel"
  // + "xml:lang style controls preload"
).split( " " );

const ALLOWED_ATTRIBUTES = { a: ["href"] };
ALLOWED_TAGS.filter( tag => tag !== "a" )
  .forEach( tag => { ALLOWED_ATTRIBUTES[tag] = ALLOWED_ATTRIBUTES_NAMES; } );

const CONFIG = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedSchemes: ["http", "https"]
};

type Props = {
  text:String,
  baseStyle?:Object,
}

const UserText = ( {
  text, baseStyle
} : Props ): React.Node => {
  const { width } = useWindowDimensions( );
  let html = text;

  const md = new MarkdownIt( {
    html: true,
    breaks: true
  } );
  html = md.render( html );

  html = sanitizeHtml( html, CONFIG );

  return (
    <View>
      <HTML
        baseStyle={baseStyle}
        contentWidth={width}
        source={{ html }}
      />
    </View>
  );
};

export default UserText;
