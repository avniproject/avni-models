import _ from "lodash";
import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import Checklist from "./Checklist";
import ChecklistItemStatus from "./ChecklistItemStatus";
import ObservationsHolder from "./ObservationsHolder";
import ChecklistItemDetail from "./ChecklistItemDetail";
import moment from "moment";
import EntityApprovalStatus from "./EntityApprovalStatus";
import SchemaNames from "./SchemaNames";
import BaseEntity from "./BaseEntity";
import Observation from "./Observation";

const mergeMap = new Map([
  [SchemaNames.EntityApprovalStatus, "approvalStatuses"]]);

class ChecklistItem extends BaseEntity {
  static schema = {
    name: SchemaNames.ChecklistItem,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      detail: "ChecklistItemDetail",
      completionDate: { type: "date", optional: true },
      observations: { type: "list", objectType: "Observation" },
      checklist: "Checklist",
      approvalStatuses: {type: "list", objectType: "EntityApprovalStatus"},
      latestEntityApprovalStatus: {type: "EntityApprovalStatus", optional: true}  //Reporting purposes
    },
  };

  constructor(that = null) {
    super(that);
  }

  get detail() {
      return this.toEntity("detail", ChecklistItemDetail);
  }

  set detail(x) {
      this.that.detail = this.fromObject(x);
  }

  get completionDate() {
      return this.that.completionDate;
  }

  set completionDate(x) {
      this.that.completionDate = x;
  }

  get observations() {
      return this.toEntityList("observations", Observation);
  }

  set observations(x) {
      this.that.observations = this.fromEntityList(x);
  }

  get checklist() {
      return this.toEntity("checklist", Checklist);
  }

  set checklist(x) {
      this.that.checklist = this.fromObject(x);
  }

  get latestEntityApprovalStatus() {
    return _.maxBy(this.approvalStatuses, 'statusDateTime');
  }

  static create({ uuid = General.randomUUID(), observations = [], checklist, detail }) {
    return _.assignIn(new ChecklistItem(), {
      uuid,
      observations,
      checklist,
      detail,
    });
  }

  static fromResource(checklistItemResource, entityService) {
    const checklist = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(checklistItemResource, "checklistUUID"),
      Checklist.schema.name
    );
    const checklistItemDetail = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(checklistItemResource, "checklistItemDetailUUID"),
      ChecklistItemDetail.schema.name
    );
    const checklistItem = General.assignFields(
      checklistItemResource,
      new ChecklistItem(),
      ["uuid"],
      ["completionDate"],
      ["observations"],
      entityService
    );
    checklistItem.checklist = checklist;
    checklistItem.detail = checklistItemDetail;
    return checklistItem;
  }

  get toResource() {
    const resource = _.pick(this, ["uuid", "name"]);
    resource["completionDate"] = General.isoFormat(this.completionDate);
    resource["checklistUUID"] = this.checklist.uuid;
    resource["checklistItemDetailUUID"] = this.detail.uuid;
    resource["observations"] = [];
    this.observations.forEach((obs) => {
      resource["observations"].push(obs.toResource);
    });
    return resource;
  }

  clone() {
    const checklistItem = new ChecklistItem();
    checklistItem.uuid = this.uuid;
    checklistItem.detail = this.detail;
    checklistItem.completionDate = this.completionDate;
    checklistItem.checklist = this.checklist;
    checklistItem.approvalStatuses = this.approvalStatuses;
    checklistItem.observations = ObservationsHolder.clone(this.observations);
    return checklistItem;
  }

  cloneForEdit() {
    return this.clone();
  }

  validate() {
    return null;
  }

  get completed() {
    return !_.isNil(this.completionDate);
  }

  expired(currentDate) {
    return !_.isNil(this.detail.expiresAfter) && currentDate.isSameOrAfter(this.expiryDate);
  }

  get expiryDate() {
    return _.isNil(this.detail.expiresAfter)
      ? null
      : moment(this.checklist.baseDate).add(this.detail.expiresAfter, "day");
  }

  get firstState() {
    return this.detail.stateConfig.find((status) => status.displayOrder === 1);
  }

  get _leadingItem() {
    return this.isDependent
      ? this.checklist.items.find((item) => item.detail.uuid === this.detail.dependentOn.uuid)
      : null;
  }

  get conceptName() {
    return this.detail.concept.name;
  }

  get approvalStatuses() {
    return this.toEntityList("approvalStatuses", EntityApprovalStatus);
  }

  set approvalStatuses(x) {
    this.that.approvalStatuses = this.fromEntityList(x);
  }

  calculateApplicableState(currentDate = moment()) {
    if (this.completed) {
      return {
        status: ChecklistItemStatus.completed,
        statusDate: this.completionDate,
      };
    }
    //console.log(`0 ${this.conceptName} ${this.checklist.baseDate} ${this.detail.expiresAfter} ${this.expiryDate} ${moment(this.checklist.baseDate).add(this.detail.expiresAfter, "day").toDate()}`);
    if (this.expired(currentDate)) {
      return {
        status: ChecklistItemStatus.expired,
        statusDate: this.expiryDate,
      };
    }

    let isLeadingItemExpired = false;
    let statusDate = null;
    const leadingItem = this._leadingItem;

    if (!_.isNil(leadingItem) && this.scheduleOnExpiryOfDependency) {
      const leadingItemState = leadingItem.calculateApplicableState().status;
      if (_.isNil(leadingItemState)) {
        return { status: null, statusDate: null };
      }
      isLeadingItemExpired = leadingItemState.state === "Expired";
    }

    let nonCompletedState = this.detail.stateConfig.find((status, index) => {
      if (!this.isDependent) {
        const minDate = moment(this.checklist.baseDate).add(status.start, "day").startOf("day");
        const maxDate = moment(this.checklist.baseDate).add(status.end, "day").endOf("day");
        //console.log(`a ${this.conceptName} ${status.state} ${minDate.toDate()} ${maxDate.toDate()}`);

        if (currentDate.isBetween(minDate, maxDate, null, "[]")) {
          statusDate = minDate.toDate();
          return true;
        }
      } else if (leadingItem.completed) {
        let minDate, maxDate;

        minDate = moment.max(
          moment(this.checklist.baseDate)
            .add(this.detail.minDaysFromStartDate, "day")
            .add(status.start, "day"),
          moment(leadingItem.completionDate)
            .add(this.detail.minDaysFromDependent, "day")
            .add(status.start, "day")
        );

        maxDate = moment.max(
          moment(this.checklist.baseDate)
            .add(this.detail.minDaysFromStartDate, "day")
            .add(status.end, "day"),
          moment(leadingItem.completionDate)
            .add(this.detail.minDaysFromDependent, "day")
            .add(status.end, "day")
        );

        //console.log(`b ${this.conceptName} ${status.state} ${minDate.toDate()} ${maxDate.toDate()}`);
        if (currentDate.isBetween(minDate, maxDate, null, "[]")) {
          statusDate = minDate.toDate();
          //console.log(`b ${statusDate}`);
          return true;
        }
      } else if (isLeadingItemExpired) {
        const minDate = moment(this.checklist.baseDate)
          .add(this.detail.minDaysFromStartDate, "day")
          .add(status.start, "day")
          .startOf("day");
        const maxDate = moment(this.checklist.baseDate)
          .add(this.detail.minDaysFromStartDate, "day")
          .add(status.end, "day")
          .endOf("day");
        //console.log(`c ${this.conceptName} ${status.state} ${this.detail.minDaysFromStartDate} ${minDate.toDate()} ${maxDate.toDate()}`);

        if (currentDate.isBetween(minDate, maxDate, null, "[]")) {
          statusDate = minDate.toDate();
          return true;
        }
      }

      return false;
    });

    if (!_.isNil(nonCompletedState)) {
      return { status: nonCompletedState, statusDate: statusDate };
    }

    return { status: null, statusDate: null };
  }

  get isDependent() {
    return this.detail.isDependent;
  }

  get scheduleOnExpiryOfDependency() {
    return this.detail.scheduleOnExpiryOfDependency;
  }

  get editable() {
    return !this.detail.voided;
  }

  setCompletionDate(date = new Date()) {
    this.completionDate = date;
  }

  print() {
    return `ChecklistItem{uuid=${this.uuid}}`;
  }

  findObservation(conceptNameOrUuid) {
    return _.find(this.observations, (observation) => {
      return (observation.concept.name === conceptNameOrUuid) || (observation.concept.uuid === conceptNameOrUuid);
    });
  }

  get individual() {
    return this.checklist.programEnrolment.individual;
  }

  getName() {
    return "ChecklistItem";
  }

  getEntityTypeName() {
    return this.checklist.detail.name;
  }

  isRejectedEntity() {
    return this.latestEntityApprovalStatus && this.latestEntityApprovalStatus.isRejected;
  }

  static merge = (childEntityClass) => BaseEntity.mergeOn(mergeMap.get(childEntityClass));

  static associateChild(child, childEntityClass, childResource, entityService) {
    let realmChecklistItem = BaseEntity.getParentEntity(
      entityService,
      childEntityClass,
      childResource,
      "entityUUID",
      ChecklistItem.schema.name
    );
    realmChecklistItem = General.pick(realmChecklistItem, ["uuid", "latestEntityApprovalStatus"], ["approvalStatuses"]);
    if (childEntityClass === EntityApprovalStatus) {
      BaseEntity.addNewChild(child, realmChecklistItem.approvalStatuses);
      realmChecklistItem.latestEntityApprovalStatus = _.maxBy(realmChecklistItem.approvalStatuses, 'statusDateTime');
    }
    return realmChecklistItem;
  }

  setLatestEntityApprovalStatus(entityApprovalStatus) {
    this.that.latestEntityApprovalStatus = this.fromObject(entityApprovalStatus);
  }
}

export default ChecklistItem;
