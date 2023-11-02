import _ from "lodash";
import IndividualRelationship from "./relationship/IndividualRelationship";

function deleteIndividual(individual, db) {
    // SUBJECT children (program enrolments)
    _.forEach(individual.enrolments, (enrolment) => {
      // ENROLMENT
      //For some reason, the last element shows up as undefined when there are multiple enrolments for a subject
      if (_.isNil(enrolment)) {
        return;
      }

      // ENROLMENT children (encounters)
      _.forEach(enrolment.encounters, (programEncounter) => {
        // PROGRAM ENCOUNTER
        // PROGRAM ENCOUNTER children (others)
        db.delete(programEncounter.approvalStatuses);
      });
      db.delete(enrolment.encounters);

      // ENROLMENT children (checklists)
      _.forEach(enrolment.checklists, (checklist) => {
        // CHECKLIST
        if (_.isNil(checklist)) {
          return;
        }

        // CHECKLIST children (checklist items)
        _.forEach(checklist.items, (checklistItem) => {
          // CHECKLIST ITEM
          if (_.isNil(checklistItem)) {
            return;
          }

          // CHECKLIST ITEM children (others)
          db.delete(checklistItem.observations);
          db.delete(checklistItem.approvalStatuses);
        });
        db.delete(checklist.items);
      });
      db.delete(enrolment.checklists);

      // ENROLMENT children (others)
      db.delete(enrolment.observations);
      db.delete(enrolment.programExitObservations);
      db.delete(enrolment.approvalStatuses);
    });
    db.delete(individual.enrolments);

    _.forEach(individual.encounters, (encounter) => {
      // ENCOUNTER
      // ENCOUNTER children (others)
      db.delete(encounter.approvalStatuses);
    });
    db.delete(individual.encounters);

    // SUBJECT children (others)
    const subjectRelationships = db.objects(IndividualRelationship.schema.name).filtered('individualA = $0 or individualB = $0', individual);
    db.delete(subjectRelationships);
    db.delete(individual.comments);
    db.delete(individual.groupSubjects);
    db.delete(individual.groups);
    db.delete(individual.approvalStatuses);

    // SUBJECT root
    db.delete(individual);
}
export default { deleteIndividual };
