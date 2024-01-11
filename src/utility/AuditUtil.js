import ResourceUtil from "./ResourceUtil";

export const AuditFields = {
    createdBy: {type: "string", optional: true},
    createdByUUID: {type: "string", optional: true},
    lastModifiedBy: {type: "string", optional: true},
    lastModifiedByUUID: {type: "string", optional: true}
}

export const mapAuditFields = function (txnEntity, txnResource) {
    txnEntity.createdBy = ResourceUtil.getFieldValue(txnResource, "createdBy");
    txnEntity.createdByUUID = ResourceUtil.getFieldValue(txnResource, "createdByUUID");
    txnEntity.lastModifiedBy = ResourceUtil.getFieldValue(txnResource, "lastModifiedBy");
    txnEntity.lastModifiedByUUID = ResourceUtil.getFieldValue(txnResource, "lastModifiedByUUID");
}
