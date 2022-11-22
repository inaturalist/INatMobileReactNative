import TableRenderer, { tableModel } from "@native-html/table-plugin";
import linkifyHtml from "linkify-html";
import MarkdownIt from "markdown-it";
import * as React from "react";
import {
  ScrollView, useWindowDimensions
} from "react-native";
import HTML from "react-native-render-html";
import WebView from "react-native-webview";
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

const SANITIZE_HTML_CONFIG = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedSchemes: ["http", "https"]
};

const LINKIFY_OPTIONS = {
  className: null,
  attributes: { rel: "nofollow" },
  ignoreTags: ["a", "code", "pre"]
};

// html table props, can use the table plugin to customize the table in the future
const tableRenderer = { table: TableRenderer };
const customHTMLElementModel = {
  table: tableModel
};

function hyperlinkMentions( text ) {
  return text.replace( /(\B)@([A-z][\\\w\\\-_]*)/g, "$1<a href='https://www.inaturalist.org/people/$2'>@$2</a>" );
}

type Props = {
  text:String,
  htmlStyle?:Object,
}

const UserText = ( {
  text, htmlStyle
} : Props ): React.Node => {
  const { width } = useWindowDimensions( );
  let html = text;

  // replace ampersands in URL params with entities so they don't get
  // interpretted by safeHtml
  html = html.replace( /&(\w+=)/g, "&amp;$1" );

  const md = new MarkdownIt( {
    html: true,
    breaks: true
  } );

  md.renderer.rules.table_open = ( ) => "<table class=\"table\">\n";

  html = md.render( html );

  html = sanitizeHtml( hyperlinkMentions( html ), SANITIZE_HTML_CONFIG );
  // Note: markdown-it has a linkifier option too, but it does not allow you
  // to specify attributes like nofollow, so we're using linkifyjs, but we
  // are ignoring URLs in the existing tags that might have them like <a> and
  // <code>

  html = linkifyHtml( html, LINKIFY_OPTIONS );

  return (
    <ScrollView>
      <HTML
        baseStyle={htmlStyle}
        contentWidth={width}
        source={{ html }}
        WebView={WebView}
        renderers={tableRenderer}
        customHTMLElementModels={customHTMLElementModel}
      />
    </ScrollView>
  );
};

export default UserText;
