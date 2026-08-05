import {assert} from "chai";
import Encounter from "../src/Encounter";

const i18n = {t: (key) => ({scheduledDate: "Scheduled", cancelled: "Cancelled"})[key] || key};

const displayServices = {
    conceptService: null,
    subjectService: null,
    addressLevelService: null,
    i18n,
    encounterService: null
};

function encounterWith(dates) {
    const encounter = Encounter.createEmptyInstance();
    encounter.encounterDateTime = null;
    return Object.assign(encounter, dates);
}

describe('getEncounterLabel with a {Date} identifier', () => {
    it('renders the encounter date for a completed encounter', () => {
        const encounter = encounterWith({encounterDateTime: new Date(2026, 7, 12)});
        assert.equal(encounter.getEncounterLabel('{Date}', displayServices), '12-Aug-2026');
    });

    it('marks an unfilled encounter as scheduled and renders its scheduled date', () => {
        const encounter = encounterWith({earliestVisitDateTime: new Date(2026, 7, 20)});
        assert.equal(encounter.getEncounterLabel('{Date}', displayServices), '20-Aug-2026 (Scheduled)');
    });

    it('marks a cancelled encounter as cancelled and renders its cancellation date', () => {
        const encounter = encounterWith({
            cancelDateTime: new Date(2026, 7, 5),
            earliestVisitDateTime: new Date(2026, 7, 20)
        });
        assert.equal(encounter.getEncounterLabel('{Date}', displayServices), '05-Aug-2026 (Cancelled)');
    });

    it('renders nothing rather than "Invalid date" when the encounter has no date at all', () => {
        assert.equal(encounterWith({}).getEncounterLabel('{Date}', displayServices), '');
    });

    it('substitutes the date within a surrounding template', () => {
        const encounter = encounterWith({earliestVisitDateTime: new Date(2026, 7, 20)});
        assert.equal(encounter.getEncounterLabel('Survey - {Date}', displayServices), 'Survey - 20-Aug-2026 (Scheduled)');
    });
});
