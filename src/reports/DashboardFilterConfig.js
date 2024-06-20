import CustomFilter from "../CustomFilter";
import Concept from "../Concept";
import _ from 'lodash';
import DateTimeUtil from "../utility/DateTimeUtil";
import Range from "./Range";
import Gender from "../Gender";
import AddressLevel from "../AddressLevel";
import Individual from "../Individual";

const widgetConceptDataTypes = [
    Concept.dataType.Date,
    Concept.dataType.DateTime,
    Concept.dataType.Time,
    Concept.dataType.Numeric
];

const conceptEntityTypes = {
    [Concept.dataType.Coded]: Concept.schema.name,
    [Concept.dataType.Location]: AddressLevel.schema.name
}

export class ObservationBasedFilter {
    scope;
    concept;
    programs;
    encounterTypes;

    constructor() {
        this.programs = [];
        this.encounterTypes = [];
    }

    isValid() {
        const {concept, programs, encounterTypes} = this;
        return !_.isNil(concept) && (!_.isEmpty(programs) || !_.isEmpty(encounterTypes) || this.scope === CustomFilter.scope.Registration);
    }

    isMultiEntityType() {
        return [Concept.dataType.Coded, Concept.dataType.Location].includes(this.concept.datatype);
    }

    getEntityType() {
        if (this.isMultiEntityType())
            return conceptEntityTypes[this.concept.datatype];
        throw new Error("Unsupported concept data type for getting entity type: " + this.concept.datatype);
    }

    toServerRequest() {
        return {
            scope: this.scope,
            conceptUUID: this.concept.uuid,
            programUUIDs: this.programs.map((x) => x.uuid),
            encounterTypeUUIDs: this.encounterTypes.map((x) => x.uuid)
        }
    }

    isWidgetRequired() {
        return widgetConceptDataTypes.includes(_.get(this.concept, "dataType"));
    }

    setPrograms(programs) {
        this.programs = programs;
    }

    setEncounterTypes(encounterTypes) {
        this.encounterTypes = encounterTypes;
    }

    setScope(scope) {
        if (this.scope !== scope) {
            this.scope = scope;
            if (!this.willObservationBeInScopeOfEncounter()) {
                this.encounterTypes = [];
            }
            if (!this.willObservationBeInScopeOfProgramEnrolment()) {
                this.programs = [];
            }
        }
    }

    willObservationBeInScopeOfProgramEnrolment() {
        return [CustomFilter.scope.ProgramEnrolment, CustomFilter.scope.ProgramEncounter].includes(this.scope);
    }

    willObservationBeInScopeOfEncounter() {
        return [CustomFilter.scope.ProgramEncounter, CustomFilter.scope.Encounter].includes(this.scope);
    }
}

export class GroupSubjectTypeFilter {
    subjectType;

    isValid() {
        return !_.isNil(this.subjectType);
    }

    toServerRequest() {
        return {
            subjectTypeUUID: this.subjectType.uuid
        }
    }
}

const dateFilterTypes = [CustomFilter.type.RegistrationDate, CustomFilter.type.EnrolmentDate, CustomFilter.type.EncounterDate, CustomFilter.type.ProgramEncounterDate];
const entityTypes = {
    [CustomFilter.type.Gender]: Gender.schema.name,
    [CustomFilter.type.Address]: AddressLevel.schema.name,
    [CustomFilter.type.GroupSubject]: Individual.schema.name
}

function isDateDataType(dashboardFilterConfig) {
    return dateFilterTypes.includes(dashboardFilterConfig.type) ||
        (dashboardFilterConfig.isConceptTypeFilter() && dashboardFilterConfig.observationBasedFilter.concept.datatype === Concept.dataType.Date);
}

function isDateTimeDataType(dashboardFilterConfig) {
    return dashboardFilterConfig.isConceptTypeFilter() && dashboardFilterConfig.observationBasedFilter.concept.datatype === Concept.dataType.DateTime;
}

function isTimeDataType(dashboardFilterConfig) {
    return dashboardFilterConfig.isConceptTypeFilter() && dashboardFilterConfig.observationBasedFilter.concept.datatype === Concept.dataType.Time;
}

class DashboardFilterConfig {
    static dataTypes = {
        array: "array",
        formMetaData: "formMetaData",
    }

    subjectType;
    type;
    widget; //CustomFilter.widget
    groupSubjectTypeFilter;
    observationBasedFilter;

    toDisplayText() {
        let s = `Type: ${this.type}.`;
        if (this.widget === CustomFilter.widget.Range) {
            s += ` Widget: ${this.widget}.`;
        }
        if (this.isConceptTypeFilter()) {
            s += ` Concept: ${this.observationBasedFilter.concept.name}. DataType: ${this.observationBasedFilter.concept.datatype}.`;
        }
        return s;
    }

    getInputDataType() {
        if (this.isConceptTypeFilter()) {
            return this.observationBasedFilter.concept.datatype;
        } else if ([CustomFilter.type.Gender, CustomFilter.type.Address, CustomFilter.type.GroupSubject].includes(this.type)) {
            return DashboardFilterConfig.dataTypes.array;
        } else if (dateFilterTypes.includes(this.type) && this.widget === CustomFilter.widget.Default) {
            return Concept.dataType.Date;
        } else if (dateFilterTypes.includes(this.type) && this.widget === CustomFilter.widget.Range) {
            return Range.DateRange;
        } else if (this.type === CustomFilter.type.SubjectType) {
            return DashboardFilterConfig.dataTypes.formMetaData;
        }
        throw new Error("Unsupported filter type: " + this.type);
    }

    isDateFilterType() {
        return isDateDataType(this) && this.widget !== CustomFilter.widget.Range;
    }

    isDateRangeFilterType() {
        return isDateDataType(this) && this.widget === CustomFilter.widget.Range;
    }

    isDateTimeFilterType() {
        return isDateTimeDataType(this) && this.widget !== CustomFilter.widget.Range;
    }

    isDateTimeRangeFilterType() {
        return isDateTimeDataType(this) && this.widget === CustomFilter.widget.Range;
    }

    isTimeFilterType() {
        return isTimeDataType(this) && this.widget !== CustomFilter.widget.Range;
    }

    isTimeRangeFilterType() {
        return isTimeDataType(this) && this.widget === CustomFilter.widget.Range;
    }

    isNumericRangeFilterType() {
        return this.isConceptTypeFilter() && this.observationBasedFilter.concept.datatype === Concept.dataType.Numeric && this.widget === CustomFilter.widget.Range;
    }

    isDateLikeFilterType() {
        return this.isDateFilterType() || this.isDateTimeFilterType() || this.isTimeFilterType();
    }

    isDateLikeRangeFilterType() {
        return this.isDateRangeFilterType() || this.isDateTimeRangeFilterType() || this.isTimeRangeFilterType();
    }

    isMultiEntityType() {
        return [CustomFilter.type.Gender, CustomFilter.type.Address, CustomFilter.type.GroupSubject].includes(this.type)
            || (this.isConceptTypeFilter() && this.observationBasedFilter.isMultiEntityType());
    }

    getEntityType() {
        if (this.isMultiEntityType()) {
            return _.isNil(entityTypes[this.type]) ? this.observationBasedFilter.getEntityType() : entityTypes[this.type];
        }
        throw new Error("Unsupported filter type: " + this.type);
    }

    isConceptTypeFilter() {
        return this.type === CustomFilter.type.Concept;
    }

    isNonCodedObservationDataType() {
        return this.isConceptTypeFilter() && this.observationBasedFilter.concept.datatype !== Concept.dataType.Coded;
    }

    isGroupSubjectTypeFilter() {
        return this.type === CustomFilter.type.GroupSubject;
    }

    isSubjectTypeFilter() {
        return this.type === CustomFilter.type.SubjectType;
    }

    isValid() {
        const valid = !(_.isNil(this.type));
        if (!valid) return valid;

        if (this.isConceptTypeFilter())
            return this.observationBasedFilter.isValid();
        else if (this.isGroupSubjectTypeFilter())
            return this.groupSubjectTypeFilter.isValid();
        else if (this.isWidgetRequired())
            return !_.isNil(this.widget);
        else
            return true;
    }

    toServerRequest() {
        const request = {
            type: this.type,
            subjectTypeUUID: this.subjectType && this.subjectType.uuid,
            widget: this.widget
        };

        if (this.isConceptTypeFilter())
            request.observationBasedFilter = this.observationBasedFilter.toServerRequest()
        else if (this.isGroupSubjectTypeFilter())
            request.groupSubjectTypeFilter = this.groupSubjectTypeFilter.toServerRequest();

        return request;
    }

    setType(type) {
        if (type !== this.type) {
            this.type = type;
            this.widget = null;
            this.groupSubjectTypeFilter = type === CustomFilter.type.GroupSubject ? new GroupSubjectTypeFilter() : null;
            this.observationBasedFilter = type === CustomFilter.type.Concept ? new ObservationBasedFilter() : null;
        }
    }

    isWidgetRequired() {
        const {
            RegistrationDate,
            EnrolmentDate,
            ProgramEncounterDate,
            EncounterDate
        } = CustomFilter.getDashboardFilterTypes();

        return [RegistrationDate, EnrolmentDate, ProgramEncounterDate, EncounterDate].includes(this.type) ||
            (this.isConceptTypeFilter() && this.observationBasedFilter.isWidgetRequired());
    }

    setSubjectType(subjectType) {
        if (_.get(subjectType, "uuid") !== _.get(this.subjectType, "uuid")) {
            this.subjectType = subjectType;
        }
    }

    willObservationBeInScopeOfProgramEnrolment() {
        return this.isConceptTypeFilter() && this.observationBasedFilter.willObservationBeInScopeOfProgramEnrolment();
    }

    willObservationBeInScopeOfEncounter() {
        return this.isConceptTypeFilter() && this.observationBasedFilter.willObservationBeInScopeOfEncounter();
    }

    validate(filterValue) {
        const inputDataType = this.getInputDataType();
        if (this.isDateRangeFilterType()) {
            return DateTimeUtil.validateDateRange(filterValue.minValue, filterValue.maxValue);
        }
        if (this.isTimeRangeFilterType()) {
            return DateTimeUtil.validateTimeRange(filterValue.minValue, filterValue.maxValue);
        }
        return [true];
    }

    clone() {
        const clone = new DashboardFilterConfig();
        clone.type = this.type;
        clone.subjectType = this.subjectType;
        clone.widget = this.widget;
        clone.groupSubjectTypeFilter = this.groupSubjectTypeFilter;
        clone.observationBasedFilter = this.observationBasedFilter;
        return clone;
    }
}

export default DashboardFilterConfig;
