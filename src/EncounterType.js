import ReferenceEntity from "./ReferenceEntity";
import General from "./utility/General";
import _ from "lodash";

class EncounterType extends ReferenceEntity {
    static schema = {
        name: 'EncounterType',
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            name: 'string',
            operationalEncounterTypeName: {type: 'string', optional: true},
            displayName: 'string',
            voided: { type: 'bool', default: false },
            encounterEligibilityCheckRule: {type: 'string', optional: true}
        }
    };

    static create(name) {
        let encounterType = new EncounterType();
        encounterType.uuid = General.randomUUID();
        encounterType.name = name;
        return encounterType;
    }

    static fromResource(operationalEncounterType) {
        const encounterType = new EncounterType();
        encounterType.name = operationalEncounterType.encounterTypeName;
        encounterType.uuid = operationalEncounterType.encounterTypeUUID;
        encounterType.voided = !!operationalEncounterType.encounterTypeVoided;
        encounterType.operationalEncounterTypeName = operationalEncounterType.name;
        encounterType.displayName = _.isEmpty(encounterType.operationalEncounterTypeName) ? encounterType.name : encounterType.operationalEncounterTypeName;
        encounterType.encounterEligibilityCheckRule = operationalEncounterType.encounterEligibilityCheckRule;
        return encounterType;
    }

    static parentAssociations = () => new Map([

    ]);

    clone() {
        return General.assignFields(this,super.clone(new EncounterType()),['operationalEncounterTypeName','displayName']);
    }
}

export default EncounterType;
