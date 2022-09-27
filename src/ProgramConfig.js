import ReferenceEntity from "./ReferenceEntity";
import Program from "./Program";
import _ from "lodash";
import General from "./utility/General";
import VisitScheduleConfig from "./VisitScheduleConfig";
import ResourceUtil from "./utility/ResourceUtil";
import Concept from "./Concept";

class ProgramConfig extends ReferenceEntity {
  static schema = {
    name: "ProgramConfig",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      program: "Program",
      atRiskConcepts: { type: "list", objectType: "Concept" },
      visitSchedule: { type: "list", objectType: "VisitScheduleConfig" },
    },
  };

   constructor(that = null) {
    super(that);
  }

  get program() {
      return this.toEntity("program", Program);
  }

  set program(x) {
      this.that.program = this.fromObject(x);
  }

  get atRiskConcepts() {
      return this.toEntityList("atRiskConcepts", Concept);
  }

  set atRiskConcepts(x) {
      this.that.atRiskConcepts = this.fromEntityList(x);
  }

  get visitSchedule() {
      return this.toEntityList("visitSchedule", VisitScheduleConfig);
  }

  set visitSchedule(x) {
      this.that.visitSchedule = this.fromEntityList(x);
  }

  static fromResource(resource, entityService) {
    const programConfig = General.assignFields(resource, new ProgramConfig(), ["uuid"]);
    programConfig.visitSchedule = _.get(resource, "visitSchedule", []).map((vs) =>
      VisitScheduleConfig.fromResource(vs, entityService)
    );
    programConfig.program = entityService.findByUUID(
      ResourceUtil.getUUIDFor(resource, "programUUID"),
      Program.schema.name
    );
    const conceptUUIDs = ResourceUtil.getUUIDFor(resource, "conceptUUIDs").split(",");
    programConfig.atRiskConcepts = conceptUUIDs.map((conceptUUID) =>
      entityService.findByUUID(conceptUUID, Concept.schema.name)
    );
    return programConfig;
  }

  static parentAssociations = () => new Map([]);

  clone() {
    return super.clone(new ProgramConfig());
  }
}

export default ProgramConfig;
