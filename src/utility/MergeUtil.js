import _ from "lodash";
import SchemaNames from "../SchemaNames";
import BaseEntity from "../BaseEntity";

class MergeUtil {
  static getMergeFunction(childEntityName, mergeMap) {
    return (args) => {
      const entity = BaseEntity.mergeOn(mergeMap.get(childEntityName))(args);
      if (childEntityName === SchemaNames.EntityApprovalStatus) {
        entity.latestEntityApprovalStatus = _.maxBy(entity.approvalStatuses, 'statusDateTime');
      }
      return entity;
    }
  }
}

export default MergeUtil;
