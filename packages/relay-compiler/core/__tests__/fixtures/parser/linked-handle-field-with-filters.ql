fragment LinkedHandleField on User {
  friends(first: 10, orderby: $orderby) @__clientField(handle: "clientFriends", filters: ["first", "orderby"]) {
    count
  }
}
