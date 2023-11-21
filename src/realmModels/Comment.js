import { Realm } from "@realm/react";

import Flag from "./Flag";
import User from "./User";

class Comment extends Realm.Object {
  static COMMENT_FIELDS = {
    uuid: true,
    body: true,
    created_at: true,
    flags: Flag.FLAG_FIELDS,
    id: true,
    user: User && User.USER_FIELDS
  };

  static mapApiToRealm( comment, realm ) {
    return {
      ...comment,
      user: User.mapApiToRealm( comment.user, realm )
    };
  }

  static schema = {
    name: "Comment",
    properties: {
      uuid: "string",
      body: "string?",
      created_at: "string?",
      flags: "Flag[]",
      id: "int?",
      user: "User?",
      // this creates an inverse relationship so comments
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "comments"
      }
    }
  };
}

export default Comment;
