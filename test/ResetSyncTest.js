import ResetSync from "../src/ResetSync";

/*
 * avni-client#2115.
 *
 * A reset sync is honoured on the device by wiping the data. That decision is
 * recorded locally as hasMigrated = true and exists nowhere on the server, so a
 * server-shaped deserialiser must not be the thing that forgets it.
 *
 * The wipe re-seeds the ResetSync checkpoint at 1900, so every later sync re-pulls
 * the user's whole reset history and fromResource runs again over rows already
 * marked done. Carry the local flag across that re-pull.
 *
 * The no-local-row case is deliberately left ABSENT rather than set to false: both
 * persist paths do partial upserts (realm-js skips undefined properties on an
 * existing row; SqliteProxy omits absent columns), so writing an explicit false
 * would overwrite a local true — the exact loss this change exists to prevent.
 * On a genuinely new row the schema default of false applies.
 */
describe('ResetSync', function () {
    const entityServiceReturning = (existingRow) => ({
        findByKey: (keyName, value, schemaName) => {
            expect(keyName).toBe('uuid');
            expect(schemaName).toBe(ResetSync.schema.name);
            return value === 'reset-1' ? existingRow : null;
        }
    });

    const resource = {uuid: 'reset-1', voided: false};

    it('carries hasMigrated = true forward from the existing local row', () => {
        const resetSync = ResetSync.fromResource(resource, entityServiceReturning({hasMigrated: true}));

        expect(resetSync.uuid).toBe('reset-1');
        expect(resetSync.hasMigrated).toBe(true);
    });

    it('carries hasMigrated = false forward from the existing local row', () => {
        const resetSync = ResetSync.fromResource(resource, entityServiceReturning({hasMigrated: false}));

        expect(resetSync.hasMigrated).toBe(false);
    });

    it('leaves hasMigrated absent when the row is new, so a partial upsert cannot overwrite a local true', () => {
        const resetSync = ResetSync.fromResource({uuid: 'reset-unseen', voided: false}, entityServiceReturning(null));

        expect(Object.prototype.hasOwnProperty.call(resetSync.that, 'hasMigrated')).toBe(false);
    });

    it('leaves hasMigrated absent when no entityService is supplied', () => {
        const resetSync = ResetSync.fromResource(resource);

        expect(resetSync.uuid).toBe('reset-1');
        expect(Object.prototype.hasOwnProperty.call(resetSync.that, 'hasMigrated')).toBe(false);
    });

    it('still reads uuid, voided and subjectTypeUUID from the resource', () => {
        const resetSync = ResetSync.fromResource(
            {uuid: 'reset-2', voided: true, _links: {subjectTypeUUID: {href: 'st-1'}}},
            entityServiceReturning(null));

        expect(resetSync.uuid).toBe('reset-2');
        expect(resetSync.voided).toBe(true);
        expect(resetSync.subjectTypeUUID).toBe('st-1');
    });
});
