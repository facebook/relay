fragment LinkedHandleField on User {
  friends(first: 10) @__clientField(handle: "clientFriends", key: "LinkedHandleField_friends") {
    count
  }
}
