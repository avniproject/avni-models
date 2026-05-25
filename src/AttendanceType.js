import BaseEntity from "./BaseEntity";
import SchemaNames from "./SchemaNames";
import {AuditFields, mapAuditFields} from "./utility/AuditUtil";
import _ from "lodash";

const CONFIG_KEYS = {
  SESSION_OUTCOME_REASON_CONCEPT: "sessionOutcomeReasonConcept",
  ABSENCE_REASON_CONCEPT: "absenceReasonConcept",
  FOLLOW_UP_ENCOUNTER_TYPE: "followUpEncounterType",
  SHARE_RULE: "shareRule",
  AUTO_SHARE_ON_SAVE: "autoShareOnSave",
};

class AttendanceType extends BaseEntity {
  static schema = {
    name: SchemaNames.AttendanceType,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      subjectTypeUUID: "string",
      name: "string",
      sortOrder: {type: "int", default: 0},
      config: {type: "string", default: "{}"},
      voided: {type: "bool", default: false},
      ...AuditFields,
    },
  };

  static configKeys = CONFIG_KEYS;

  constructor(that = null) {
    super(that);
  }

  get subjectTypeUUID() {
    return this.that.subjectTypeUUID;
  }

  set subjectTypeUUID(x) {
    this.that.subjectTypeUUID = x;
  }

  get name() {
    return this.that.name;
  }

  set name(x) {
    this.that.name = x;
  }

  get sortOrder() {
    return this.that.sortOrder;
  }

  set sortOrder(x) {
    this.that.sortOrder = x;
  }

  get config() {
    return this.that.config;
  }

  set config(x) {
    this.that.config = x;
  }

  get createdBy() {
    return this.that.createdBy;
  }

  set createdBy(x) {
    this.that.createdBy = x;
  }

  get lastModifiedBy() {
    return this.that.lastModifiedBy;
  }

  set lastModifiedBy(x) {
    this.that.lastModifiedBy = x;
  }

  get createdByUUID() {
    return this.that.createdByUUID;
  }

  set createdByUUID(x) {
    this.that.createdByUUID = x;
  }

  get lastModifiedByUUID() {
    return this.that.lastModifiedByUUID;
  }

  set lastModifiedByUUID(x) {
    this.that.lastModifiedByUUID = x;
  }

  getConfig() {
    if (_.isEmpty(this.config)) return {};
    try {
      return JSON.parse(this.config);
    } catch (_e) {
      return {};
    }
  }

  setConfig(obj) {
    this.config = JSON.stringify(obj || {});
  }

  getSessionOutcomeReasonConceptUUID() {
    return this.getConfig()[CONFIG_KEYS.SESSION_OUTCOME_REASON_CONCEPT] || null;
  }

  getAbsenceReasonConceptUUID() {
    return this.getConfig()[CONFIG_KEYS.ABSENCE_REASON_CONCEPT] || null;
  }

  getFollowUpEncounterTypeUUID() {
    return this.getConfig()[CONFIG_KEYS.FOLLOW_UP_ENCOUNTER_TYPE] || null;
  }

  getShareRule() {
    return this.getConfig()[CONFIG_KEYS.SHARE_RULE] || null;
  }

  isAutoShareOnSave() {
    return !!this.getConfig()[CONFIG_KEYS.AUTO_SHARE_ON_SAVE];
  }

  static fromResource(resource) {
    const at = new AttendanceType();
    at.uuid = resource.uuid;
    at.subjectTypeUUID = resource.subjectTypeUUID;
    at.name = resource.name;
    at.sortOrder = _.isNil(resource.sortOrder) ? 0 : resource.sortOrder;
    const config = resource.config;
    if (_.isNil(config)) {
      at.config = "{}";
    } else if (_.isString(config)) {
      at.config = config;
    } else {
      at.config = JSON.stringify(config);
    }
    at.voided = !!resource.voided;
    mapAuditFields(at, resource);
    return at;
  }

  get toResource() {
    return _.pick(this, ["uuid", "subjectTypeUUID", "name", "sortOrder", "config", "voided"]);
  }
}

export default AttendanceType;
