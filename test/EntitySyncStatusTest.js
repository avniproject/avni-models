import EntitySyncStatus from "../src/EntitySyncStatus";
import EntityMappingConfig from "../src/Schema";

// avniproject/avni-client#2099: the sync cursor is the last row's timestamp plus its uuid.
describe("EntitySyncStatus.lastUuid", () => {
  it("is an optional string in the Realm schema, so existing rows stay valid", () => {
    expect(EntitySyncStatus.schema.properties.lastUuid).toEqual({type: "string", optional: true});
  });

  it("is empty when a status is created without one", () => {
    const status = EntitySyncStatus.create("Individual", EntitySyncStatus.REALLY_OLD_DATE, "uuid-1", "");
    expect(status.lastUuid).toBeNull();
    expect(status.toJSON().lastUuid).toBeNull();
  });

  it("keeps the uuid it is given alongside loadedSince", () => {
    const loadedSince = new Date("2023-12-11T05:01:41.519Z");
    const status = EntitySyncStatus.create("Encounter", loadedSince, "uuid-1", "type-1", "last-row-uuid");
    expect(status.loadedSince).toBe(loadedSince);
    expect(status.lastUuid).toBe("last-row-uuid");
    expect(status.toJSON().lastUuid).toBe("last-row-uuid");
  });

  it("can be cleared", () => {
    const status = EntitySyncStatus.create("Encounter", new Date(), "uuid-1", "type-1", "last-row-uuid");
    status.lastUuid = null;
    expect(status.lastUuid).toBeNull();
  });

  it("comes with a schema version bump", () => {
    expect(EntityMappingConfig.getInstance().getSchemaVersion()).toBe(221);
  });
});
