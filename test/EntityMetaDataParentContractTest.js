import EntityMetaData from "../src/EntityMetaData";

// Sync pipelines (e.g. SyncService.persistAll in avni-client) rely on a contract:
// if an EntityMetaData entry declares `parent`, the parent.entityClass MUST expose
// `associateChild(child, childEntityClass, childResource, entityService)` and
// `merge(childSchemaName)` statics. The pipeline calls these as part of attaching
// each incoming child to its parent's Realm list during pull sync.
//
// Past regression (avni-models 1.33.47): AttendanceType / CalendarDateMarker /
// AttendanceRecord / Session were given parent hints but their parent classes
// (SubjectType / Calendar / Individual / Session) hold no Realm list of children
// and never implemented associateChild — sync crashed with
// "associateChild is not a function" the first time any of these rows arrived.
// This test fails fast if any future EntityMetaData entry breaks the contract.

describe("EntityMetaData parent contract", () => {
    // Push-only entities (syncPullRequired = false) never enter SyncService.persistAll
    // so a missing associateChild/merge on their parent class is latent — declared but
    // unreached. Skip those here. VideoTelemetric is the current example.
    EntityMetaData.model().forEach((entityMetaData) => {
        if (!entityMetaData.parent) return;
        if (entityMetaData.syncPullRequired === false) return;

        describe(`${entityMetaData.entityName} declares parent ${entityMetaData.parent.entityName}`, () => {
            it("parent.entityClass.associateChild is a static function", () => {
                const fn = entityMetaData.parent.entityClass.associateChild;
                expect(typeof fn).toBe("function");
            });

            it("parent.entityClass.merge is a static function", () => {
                const fn = entityMetaData.parent.entityClass.merge;
                expect(typeof fn).toBe("function");
            });
        });
    });
});
