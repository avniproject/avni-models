/*
Records what is handed to filtered() so tests can assert on the arguments that actually reach realm.
The plain arrays used elsewhere in these tests as stub collections have no filtered().
 */
class StubbedRealmCollection {
  constructor(...items) {
    this.items = items;
    this.length = items.length;
  }

  filtered(query, ...args) {
    this.filteredQuery = query;
    this.filteredArgs = args;
    return [];
  }
}

export default StubbedRealmCollection;
