import {assert} from "chai";
import BaseEntity from "../src/BaseEntity";
import EntityFactory from "./EntityFactory";
import General from "../src/utility/General";
import FormElementGroup from "../src/application/FormElementGroup";
import _ from 'lodash';

describe('BaseEntityTest', () => {
    it('collectionHasEntity', () => {
        assert.equal(BaseEntity.collectionHasEntity([{uuid: 'abc'}], {uuid: 'abc'}), true);
        assert.equal(BaseEntity.collectionHasEntity([{uuid: 'abc'}], {uuid: 'efg'}), false);
    });

    it('validateFieldIsNotEmpty', () => {
        const baseEntity = new BaseEntity();
        assert.equal(baseEntity.validateFieldForEmpty(null, '').success, false);
        assert.equal(baseEntity.validateFieldForEmpty(new Date(), '').success, true);
        assert.equal(baseEntity.validateFieldForEmpty('', '').success, false);
    });

    it('addNewChild', () => {
        const form = EntityFactory.createForm('foo');
        const formElementGroup = new FormElementGroup();
        formElementGroup.uuid = General.randomUUID();

        const pickedForm = General.pick(form, [], ["formElementGroups"]);
        BaseEntity.addNewChild(formElementGroup, pickedForm.formElementGroups);
        assert.equal(pickedForm.formElementGroups.length, 1);
        BaseEntity.addNewChild(formElementGroup, pickedForm.formElementGroups);
        assert.equal(pickedForm.formElementGroups.length, 1);
    });

    it('mergeShouldWorkFast', () => {
        const individuals = _.times(10, (iIndex) => ({uuid: `ind-uuid`}));
        individuals.forEach((ind, index) => {
            function createInitEncounters(number, index) {
                let encounters = _.times(number, (eIndex) => ({uuid: `uuid-${eIndex}` }));
                encounters.push({uuid: `uuid-${index}` })
                return encounters;
            }

            ind['encounters'] = createInitEncounters(500, index);
        });
        let start = performance.now();
        BaseEntity.mergeOn('encounters')(individuals);
        let timeTaken = performance.now() - start;
        expect( timeTaken).toBeLessThanOrEqual(10);
    });

    it('mergeWillHaveAllKeys', () => {
        const individual1 = {encounters: [{uuid: "1"},{ uuid: "2"}]};
        const individual2 = {encounters: [{uuid: "2"},{ uuid: "3"}]};
        const mergedIndividual = BaseEntity.mergeOn('encounters')([individual1, individual2]);
        expect(mergedIndividual.encounters.length).toEqual(3);
    });
});
