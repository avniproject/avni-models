import WorkItem from "../../src/application/WorkItem";

describe('WorkItem', () => {

    it('is initialized with a type and parameters', () => {
        new WorkItem(
            'd434e5f6-59f7-420b-8303-ca2623ac381e',
            WorkItem.type.REGISTRATION, {
            subjectTypeName: 'Individual',
        });
        new WorkItem(
            '185d334d-7a80-4b3b-8404-fdcba0e074b1',
            WorkItem.type.ENCOUNTER, {subjectUUID: '25479684-7ae4-44d8-bfd2-d5321dbc28bc'});
        new WorkItem(
            '185d334d-7a80-4b3b-8404-fdcba0e074b1',
            WorkItem.type.PROGRAM_ENROLMENT, {
            subjectUUID: '25479684-7ae4-44d8-bfd2-d5321dbc28bc',
            programName: 'Mother Programme'
        });
        new WorkItem(
            '185d334d-7a80-4b3b-8404-fdcba0e074b1',
            WorkItem.type.PROGRAM_ENCOUNTER, {
            subjectUUID: '25479684-7ae4-44d8-bfd2-d5321dbc28bc',
            programEnrolmentUUID: '88878496-45d9-4348-a5da-3255e1cfcfd8',
            encounterType: 'Child'
        });
        new WorkItem(
            '185d334d-7a80-4b3b-8404-fdcba0e074b1',
            WorkItem.type.ENCOUNTER, {
            subjectUUID: '25479684-7ae4-44d8-bfd2-d5321dbc28bc'
        });
    });

    //Since openchs-models is used outside the platform, it makes sense to have good contract validations.
    it('validates that the parameters are sufficient to perform the work', () => {
        const workItemWithoutId = () => new WorkItem().validate();
        const workItemWithoutType = () => new WorkItem('185d334d-7a80-4b3b-8404-fdcba0e074b1').validate();
        const encounterWithoutIndividual = () =>  new WorkItem(
            '185d334d-7a80-4b3b-8404-fdcba0e074b1',
            WorkItem.type.ENCOUNTER).validate();
        const programEncounterWithoutIndividual = () =>  new WorkItem(
            '185d334d-7a80-4b3b-8404-fdcba0e074b1',
            WorkItem.type.PROGRAM_ENCOUNTER, {
            programEnrolmentUUID: '88878496-45d9-4348-a5da-3255e1cfcfd8',
            encounterType: 'Child'
        }).validate();
        expect(workItemWithoutId).toThrow('Id is mandatory');
        expect(workItemWithoutType).toThrow('Work item must be one of WorkItem.type');
        expect(encounterWithoutIndividual).toThrow('subjectUUID is mandatory');
        expect(programEncounterWithoutIndividual).toThrow('subjectUUID is mandatory');
    });

    describe('SHARE work item', () => {
        const subjectUUID = '25479684-7ae4-44d8-bfd2-d5321dbc28bc';

        it('accepts pdf format', () => {
            new WorkItem('id1', WorkItem.type.SHARE, {subjectUUID, format: 'pdf'}).validate();
        });

        it('accepts text format', () => {
            new WorkItem('id1', WorkItem.type.SHARE, {subjectUUID, format: 'text'}).validate();
        });

        it('rejects missing format', () => {
            const fn = () => new WorkItem('id1', WorkItem.type.SHARE, {subjectUUID}).validate();
            expect(fn).toThrow(/format must be 'pdf' or 'text'/);
        });

        it('rejects invalid format', () => {
            const fn = () => new WorkItem('id1', WorkItem.type.SHARE, {subjectUUID, format: 'docx'}).validate();
            expect(fn).toThrow(/format must be 'pdf' or 'text'/);
        });

        it('rejects missing subjectUUID', () => {
            const fn = () => new WorkItem('id1', WorkItem.type.SHARE, {format: 'pdf'}).validate();
            expect(fn).toThrow('subjectUUID is mandatory');
        });
    });

    describe('SHARE_SESSION work item', () => {
        const sessionUUID = 'a5d8b2f0-1c47-4a4b-9be3-6c33d61e1b88';

        it('accepts pdf format', () => {
            new WorkItem('id1', WorkItem.type.SHARE_SESSION, {sessionUUID, format: 'pdf'}).validate();
        });

        it('accepts text format', () => {
            new WorkItem('id1', WorkItem.type.SHARE_SESSION, {sessionUUID, format: 'text'}).validate();
        });

        it('rejects missing sessionUUID', () => {
            const fn = () => new WorkItem('id1', WorkItem.type.SHARE_SESSION, {format: 'pdf'}).validate();
            expect(fn).toThrow('sessionUUID is mandatory');
        });

        it('rejects missing format', () => {
            const fn = () => new WorkItem('id1', WorkItem.type.SHARE_SESSION, {sessionUUID}).validate();
            expect(fn).toThrow(/format must be 'pdf' or 'text'/);
        });

        it('rejects invalid format', () => {
            const fn = () => new WorkItem('id1', WorkItem.type.SHARE_SESSION, {sessionUUID, format: 'docx'}).validate();
            expect(fn).toThrow(/format must be 'pdf' or 'text'/);
        });

        it('does not require subjectUUID', () => {
            new WorkItem('id1', WorkItem.type.SHARE_SESSION, {sessionUUID, format: 'pdf'}).validate();
        });
    });
});