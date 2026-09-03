import {assert} from "chai";
import _ from "lodash";
import EntityApprovalStatus from "../src/EntityApprovalStatus";
import ApprovalStatus from "../src/ApprovalStatus";
import Observation from "../src/Observation";
import Concept from "../src/Concept";
import Form from "../src/application/Form";
import EntityFactory from "./EntityFactory";
import General from "../src/utility/General";

/**
 * avniproject/avni-models#71 - an approval decision carries the answers the approver gave on the
 * Approval or Rejection form, and those answers have to survive the round trip in both directions.
 *
 * The reason schema and sync live in one test file, as they live in one story: the sync payload is a
 * field whitelist both ways, so adding the Realm property on its own changes nothing about what crosses
 * the wire. A model that looks correct while the payload silently drops the answers is the single
 * highest-risk failure mode in this feature, so toResource and fromResource are asserted separately -
 * one passing tells you nothing about the other.
 */
describe('EntityApprovalStatusTest', () => {
    const rejectionReasonUuid = "concept-rejection-reason";
    const rejectionNoteUuid = "concept-rejection-note";

    let rejectionReason, rejectionNote, entityService, rejectedStatus;

    function anApprovalStatus(status) {
        const approvalStatus = new ApprovalStatus();
        approvalStatus.uuid = General.randomUUID();
        approvalStatus.status = status;
        return approvalStatus;
    }

    beforeEach(() => {
        rejectionReason = EntityFactory.createConcept("Rejection reason", Concept.dataType.Text, rejectionReasonUuid);
        rejectionNote = EntityFactory.createConcept("Rejection note", Concept.dataType.Text, rejectionNoteUuid);
        // Observations resolve their concept through entityService; a device that has not synced the
        // answer concepts maps them to nothing, which is why this is stubbed explicitly per uuid.
        rejectedStatus = anApprovalStatus(ApprovalStatus.statuses.Rejected);
        entityService = {
            findByKey: (key, value, schemaName) => {
                if (schemaName === Concept.schema.name) {
                    return value === rejectionReasonUuid ? rejectionReason : rejectionNote;
                }
                return rejectedStatus;
            }
        };
    });

    function observationOf(concept, value) {
        return Observation.create(concept, concept.getValueWrapperFor(value));
    }

    function aRejection(observations) {
        const entityApprovalStatus = EntityApprovalStatus.create(
            "entity-uuid", EntityApprovalStatus.entityType.Subject,
            rejectedStatus,
            "Address did not match", false, "subject-type-uuid", observations);
        entityApprovalStatus.uuid = General.randomUUID();
        return entityApprovalStatus;
    }

    // AC #1 - the decision can hold answers on the device

    it('has an optional observations list on the schema', () => {
        const property = EntityApprovalStatus.schema.properties.observations;

        assert.isOk(property, "observations must be declared on the schema");
        assert.equal("list", property.type);
        // scripts/validateSchemas.js fails the build for a list without an explicit objectType, which
        // Realm v12 requires.
        assert.equal("Observation", property.objectType);
    });

    it('round-trips observations through the getter and setter', () => {
        const entityApprovalStatus = new EntityApprovalStatus();

        entityApprovalStatus.observations = [observationOf(rejectionReason, "Wrong address")];

        assert.equal(1, entityApprovalStatus.observations.length);
        assert.equal(rejectionReasonUuid, entityApprovalStatus.observations[0].concept.uuid);
    });

    // AC #3 - a decision recorded here reaches the server with its answers

    it('sends the answers in the outgoing sync payload', () => {
        const resource = aRejection([
            observationOf(rejectionReason, "Wrong address"),
            observationOf(rejectionNote, "Door number missing")
        ]).toResource;

        assert.isArray(resource.observations, "the payload must carry the answers, not just the model");
        assert.equal(2, resource.observations.length);
        assert.sameMembers([rejectionReasonUuid, rejectionNoteUuid],
            _.map(resource.observations, "conceptUUID"));
    });

    it('keeps the rest of the outgoing payload unchanged', () => {
        const resource = aRejection([observationOf(rejectionReason, "Wrong address")]).toResource;

        assert.equal("Subject", resource.entityType);
        assert.equal("Address did not match", resource.approvalStatusComment);
        assert.equal("entity-uuid", resource.entityUuid);
        assert.equal("subject-type-uuid", resource.entityTypeUuid);
        assert.isOk(resource.statusDateTime);
    });

    // AC #4 - a decision recorded elsewhere arrives here with its answers

    it('reads the answers out of the incoming sync payload', () => {
        const resource = {
            uuid: "eas-uuid",
            entityType: "Subject",
            entityUUID: "entity-uuid",
            entityTypeUuid: "subject-type-uuid",
            approvalStatusComment: "Address did not match",
            autoApproved: false,
            voided: false,
            statusDateTime: "2026-09-01T10:00:00.000Z",
            observations: {[rejectionReasonUuid]: "Wrong address"}
        };

        const entityApprovalStatus = EntityApprovalStatus.fromResource(resource, entityService);

        assert.equal(1, entityApprovalStatus.observations.length,
            "an incoming decision must arrive with its answers");
        assert.equal(rejectionReasonUuid, entityApprovalStatus.observations[0].concept.uuid);
    });

    // AC #5 - a decision with no answers travels exactly as it does today

    it('sends an empty list when the decision has no answers', () => {
        const resource = aRejection([]).toResource;

        assert.isArray(resource.observations);
        assert.equal(0, resource.observations.length);
    });

    /**
     * The case every client released before this feature produces. The failure mode would be silent and
     * total - an exception here breaks the entire incoming sync batch, not just the answers.
     */
    it('accepts an incoming decision with no observations key at all', () => {
        const resource = {
            uuid: "eas-uuid",
            entityType: "Subject",
            entityUUID: "entity-uuid",
            entityTypeUuid: "subject-type-uuid",
            approvalStatusComment: "Address did not match",
            autoApproved: false,
            voided: false,
            statusDateTime: "2026-09-01T10:00:00.000Z"
        };

        const entityApprovalStatus = EntityApprovalStatus.fromResource(resource, entityService);

        assert.equal(0, entityApprovalStatus.observations.length);
        assert.equal("Address did not match", entityApprovalStatus.approvalStatusComment);
    });

    // create() - what the client's EntityApprovalStatusService.saveStatus calls

    it('defaults to no answers when create() is called the way it is today', () => {
        const entityApprovalStatus = EntityApprovalStatus.create(
            "entity-uuid", EntityApprovalStatus.entityType.Subject,
            rejectedStatus,
            "a comment", false, "subject-type-uuid");

        assert.equal(0, entityApprovalStatus.observations.length,
            "the existing six-argument callers must keep working untouched");
    });

    it('carries answers passed to create()', () => {
        const entityApprovalStatus = EntityApprovalStatus.create(
            "entity-uuid", EntityApprovalStatus.entityType.Subject,
            rejectedStatus,
            "a comment", false, "subject-type-uuid",
            [observationOf(rejectionReason, "Wrong address")]);

        assert.equal(1, entityApprovalStatus.observations.length);
    });

    // AC #6 - the administrator's approval and rejection forms are recognised

    it('recognises Approval and Rejection as form types', () => {
        assert.equal("Approval", Form.formTypes.Approval);
        assert.equal("Rejection", Form.formTypes.Rejection);
    });

    it('leaves the existing form types alone', () => {
        assert.equal("IndividualProfile", Form.formTypes.IndividualProfile);
        assert.equal("ProgramEncounter", Form.formTypes.ProgramEncounter);
        assert.equal("Task", Form.formTypes.Task);
    });
});
