import CustomFilter from "../CustomFilter";
import Concept from "../Concept";
import _ from 'lodash';

const widgetConceptDataTypes = [
  Concept.dataType.Date,
  Concept.dataType.DateTime,
  Concept.dataType.Time,
  Concept.dataType.Numeric
];

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

class DashboardFilterConfig {
  subjectType;
  type;
  widget; //CustomFilter.widget
  groupSubjectTypeFilter;
  observationBasedFilter;

  isConceptTypeFilter() {
    return this.type === CustomFilter.type.Concept;
  }

  isGroupSubjectTypeFilter() {
    return this.type === CustomFilter.type.GroupSubject;
  }

  isValid() {
    const valid = !(_.isNil(this.type) || _.isNil(this.subjectType));
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
      subjectTypeUUID: this.subjectType.uuid,
      type: this.type,
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
      if (!_.isNil(this.observationBasedFilter)) {
        this.observationBasedFilter.programs = [];
        this.observationBasedFilter.encounterTypes = [];
      } else if (!_.isNil(this.groupSubjectTypeFilter)) {
        this.groupSubjectTypeFilter.subjectType = null;
      }
    }
  }

  willObservationBeInScopeOfProgramEnrolment() {
    return this.isConceptTypeFilter() && this.observationBasedFilter.willObservationBeInScopeOfProgramEnrolment();
  }

  willObservationBeInScopeOfEncounter() {
    return this.isConceptTypeFilter() && this.observationBasedFilter.willObservationBeInScopeOfEncounter();
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
