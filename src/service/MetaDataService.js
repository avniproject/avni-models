import _ from "lodash";
import Form from "../application/Form";
import SchemaNames from "../SchemaNames";

const observationHolders = new Map();
observationHolders.set(SchemaNames.Individual, ["observations"]);
observationHolders.set(SchemaNames.DraftSubject, ["observations"]);
observationHolders.set(SchemaNames.Encounter, ["observations", "cancelObservations"]);
observationHolders.set(SchemaNames.DraftEncounter, ["observations", "cancelObservations"]);
observationHolders.set(SchemaNames.SubjectProgramEligibility, ["observations"]);
observationHolders.set(SchemaNames.IndividualRelationship, ["exitObservations"]);
observationHolders.set(SchemaNames.AddressLevel, ["locationProperties"]);
observationHolders.set(SchemaNames.ChecklistItem, ["observations"]);
observationHolders.set(SchemaNames.Family, ["observations"]);
observationHolders.set(SchemaNames.ProgramEncounter, ["observations", "cancelObservations"]);
observationHolders.set(SchemaNames.ProgramEnrolment, ["observations", "programExitObservations"]);
observationHolders.set(SchemaNames.Task, ["metadata", "observations"]);
observationHolders.set(SchemaNames.Family, ["observations"]);

const pointHolders = new Map();
pointHolders.set(SchemaNames.DraftEncounter, ["encounterLocation", "cancelLocation"]);
pointHolders.set(SchemaNames.DraftSubject, ["registrationLocation"]);
pointHolders.set(SchemaNames.Encounter, ["encounterLocation", "cancelLocation"]);
pointHolders.set(SchemaNames.Individual, ["registrationLocation"]);
pointHolders.set(SchemaNames.ProgramEncounter, ["encounterLocation", "cancelLocation"]);
pointHolders.set(SchemaNames.ProgramEnrolment, ["enrolmentLocation", "exitLocation"]);

class MetaDataService {
    static forEachPointField(fn) {
        pointHolders.forEach((pointFields, schemaName) => {
            pointFields.forEach((observationField) => {
                fn(observationField, schemaName);
            })
        });
    }

    static forEachObservationField(fn) {
        observationHolders.forEach((observationFields, schemaName) => {
            observationFields.forEach((observationField) => {
                fn(observationField, schemaName);
            })
        });
    }

    static everyObservationField(fn) {
        const schemaAndObsFields = Array.from(observationHolders, ([schema, observationFields]) => ({ schema, observationFields }));
        return schemaAndObsFields.every(({ schema, observationFields }) => {
            return observationFields.every((observationField) => {
                return fn(observationField, schema);
            });
        });
    }

    static getProgramFormMappings(formMappings) {
        return _.filter(
            formMappings,
            formMapping => formMapping.formType === Form.formTypes.ProgramEnrolment
        );
    }

    static getGeneralEncounterFormMappings(formMappings) {
        return _.filter(
            formMappings,
            formMapping =>
                formMapping.formType === Form.formTypes.Encounter ||
                formMapping.formType === Form.formTypes.IndividualEncounterCancellation
        );
    }

    static getProgramEncounterFormMappings(formMappings) {
        return _.filter(
            formMappings,
            formMapping =>
                formMapping.formType === Form.formTypes.ProgramEncounter ||
                formMapping.formType === Form.formTypes.ProgramEncounterCancellation
        );
    }

    static getProgramsForSubjectType(allPrograms, subjectType, formMappings) {
        if (_.isNil(subjectType)) return allPrograms;

        const programFormMappingsForSubjectType = _.filter(formMappings, formMapping =>
            (formMapping.subjectTypeUUID === subjectType.uuid) && (formMapping.formType === Form.formTypes.ProgramEnrolment));
        return _.intersectionWith(allPrograms, programFormMappingsForSubjectType, (p, fm) => p.uuid === fm.programUUID);
    }

    static getEncounterTypesForSubjectType(allEncounterTypes, subjectType, formMappings) {
        if (_.isNil(subjectType)) return allEncounterTypes;

        const generalEncounterFormMappingsForSubjectType = _.filter(
            this.getGeneralEncounterFormMappings(formMappings),
            formMapping => formMapping.subjectTypeUUID === subjectType.uuid
        );
        return generalEncounterFormMappingsForSubjectType.map(x =>
            _.some(allEncounterTypes, et => et.uuid === x.encounterTypeUUID)
        );
    }

    static getEncounterTypesForPrograms(allEncounterTypes, programs, formMappings) {
        const programEncounterTypeMappings = MetaDataService.getProgramEncounterFormMappings(formMappings);
        const encounterTypeMappingsForPrograms = _.intersectionWith(programEncounterTypeMappings, programs, (etMapping, program) => etMapping.programUUID === program.uuid);
        return encounterTypeMappingsForPrograms.map((x) => _.find(allEncounterTypes, (et) => et.uuid === x.encounterTypeUUID));
    }

    static getEncounterTypes_For_SubjectTypeAndPrograms(
        allEncounterTypes,
        subjectType,
        programs,
        formMappings
    ) {
        if (_.isEmpty(programs))
            return MetaDataService.getEncounterTypesForSubjectType(allEncounterTypes, subjectType, formMappings);

        return MetaDataService.getEncounterTypesForPrograms(allEncounterTypes, programs, formMappings);
    }

    static getPossibleGroupSubjectTypesFor(subjectTypes, subjectType) {
        return _.isNil(subjectType) ?
            _.filter(subjectTypes, (x) => x.group) :
            _.filter(subjectTypes, (x) => (x.uuid !== subjectType.uuid) && (x.group));
    }
}

export default MetaDataService;
