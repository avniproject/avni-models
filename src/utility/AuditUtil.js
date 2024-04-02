import ResourceUtil from "./ResourceUtil";
import _ from "lodash";

export const AuditFields = {
    createdBy: {type: "string", optional: true},
    createdByUUID: {type: "string", optional: true},
    lastModifiedBy: {type: "string", optional: true},
    lastModifiedByUUID: {type: "string", optional: true}
}

export function updateAuditFields(entity, userInfo, isNew = false) {
    // old entities may have createdByUUID as null if never synced after audit release
    // isNew must be passed by callers to specify that it is indeed a create scenario
    if (_.isNil(entity.createdByUUID) && isNew) {
        entity.createdByUUID = userInfo.userUUID;
        entity.createdBy = userInfo.name;
    }
    if (_.isNil(entity.lastModifiedByUUID)) {
        entity.lastModifiedByUUID = userInfo.userUUID;
        entity.lastModifiedBy = userInfo.name;
    }
}

export function mapAuditFields(txnEntity, txnResource) {
    txnEntity.createdBy = ResourceUtil.getFieldValue(txnResource, "createdBy");
    txnEntity.createdByUUID = ResourceUtil.getFieldValue(txnResource, "createdByUUID");
    txnEntity.lastModifiedBy = ResourceUtil.getFieldValue(txnResource, "lastModifiedBy");
    txnEntity.lastModifiedByUUID = ResourceUtil.getFieldValue(txnResource, "lastModifiedByUUID");
}
