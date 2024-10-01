import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import StandardReportCardType from "./StandardReportCardType";
import _ from 'lodash';
import SubjectType from "./SubjectType";
import Program from "./Program";
import EncounterType from "./EncounterType";
import Duration from "./Duration";
import NestedReportCardResult from "./reports/NestedReportCardResult";

class ReportCard extends BaseEntity {
    static schema = {
        name: "ReportCard",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            query: {type: "string", optional: true},
            description: {type: "string", optional: true},
            standardReportCardType: {type: "StandardReportCardType", optional: true},
            colour: "string",
            voided: {type: "bool", default: false},
            nested: {type: "bool", default: false, optional: true},
            countOfCards: {type: "int", default: 1, optional: true}, //Used only by nested ReportCards
            standardReportCardInputSubjectTypes: {type: "list", objectType: "SubjectType"},
            standardReportCardInputPrograms: {type: "list", objectType: "Program"},
            standardReportCardInputEncounterTypes: {type: "list", objectType: "EncounterType"},
            standardReportCardInputRecentDurationJSON: {type: "string", optional: true}
        },
    };

    static newReportCard() {
        const reportCard = new ReportCard();
        reportCard.standardReportCardInputSubjectTypes = [];
        reportCard.standardReportCardInputPrograms = [];
        reportCard.standardReportCardInputEncounterTypes = [];
        return reportCard;
    }

    constructor(that = null) {
        super(that);
    }

    get name() {
        return this.that.name;
    }

    set name(x) {
        this.that.name = x;
    }

    get query() {
        return this.that.query;
    }

    set query(x) {
        this.that.query = x;
    }

    get description() {
        return this.that.description;
    }

    set description(x) {
        this.that.description = x;
    }

    get standardReportCardType() {
        return this.toEntity("standardReportCardType", StandardReportCardType);
    }

    set standardReportCardType(x) {
        this.that.standardReportCardType = this.fromObject(x);
    }

    get colour() {
        return this.that.colour;
    }

    set colour(x) {
        this.that.colour = x;
    }

    get nested() {
        return this.that.nested;
    }

    set nested(x) {
        this.that.nested = x;
    }

    get countOfCards() {
        return this.that.countOfCards;
    }

    set countOfCards(x) {
        this.that.countOfCards = x;
    }

    get iconName() {
        //TODO: right now not syncing the icon name uploaded from app designer.
        return _.isNil(this.standardReportCardType) ? null : this.standardReportCardType.iconName;
    }

    get cardColor() {
        return _.isNil(this.standardReportCardType) ? this.colour : this.standardReportCardType.cardColor;
    }

    get textColor() {
        return _.isNil(this.standardReportCardType) ? '#ffffff' : this.standardReportCardType.textColor;
    }

    get standardReportCardInputSubjectTypes() {
        return this.toEntityList("standardReportCardInputSubjectTypes", SubjectType);
    }

    set standardReportCardInputSubjectTypes(x) {
        this.that.standardReportCardInputSubjectTypes = this.fromEntityList(x);
    }

    get standardReportCardInputPrograms() {
        return this.toEntityList("standardReportCardInputPrograms", Program);
    }

    set standardReportCardInputPrograms(x) {
        this.that.standardReportCardInputPrograms = this.fromEntityList(x);
    }

    get standardReportCardInputEncounterTypes() {
        return this.toEntityList("standardReportCardInputEncounterTypes", EncounterType);
    }

    set standardReportCardInputEncounterTypes(x) {
        this.that.standardReportCardInputEncounterTypes = this.fromEntityList(x);
    }

    getStandardReportCardInputRecentDuration() {
        if (_.isEmpty(this.that.standardReportCardInputRecentDurationJSON)) {
            return new Duration(1, Duration.Day);
        }
        const duration = JSON.parse(this.that.standardReportCardInputRecentDurationJSON);
        return new Duration(duration.value, duration.unit);
    }

    setStandardReportCardInputRecentDurationJSON(x) {
        this.that.standardReportCardInputRecentDurationJSON = x;
    }

    /**
     * Helper method used to generate unique key value for Nested Report Cards using UUID and Index of the Report Card.
     * The Nested Report Card's query responses would be mapped to the corresponding Dashboard Report cards using the UUID and Index.
     *
     * @param index
     * @returns {string}
     */
    getCardId(index = 0) {
        return this.uuid + '#' + index;
    }

    getCardName(response, index = 0) {
        return _.get(response, `reportCards[${index}].name`) || this.name;
    }

    getCardColor(response, index = 0) {
        return _.get(response, `reportCards[${index}].cardColor`) || this.cardColor;
    }

    getTextColor(response, index = 0) {
        return _.get(response, `reportCards[${index}].textColor`) || this.textColor;
    }

    static fromResource(resource, entityService) {
        const reportCard = General.assignFields(resource, ReportCard.newReportCard(),
            ["uuid", "name", "query", "description", "colour", "voided", "nested", "countOfCards"]);
        reportCard.standardReportCardType = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "standardReportCardUUID"),
            StandardReportCardType.schema.name
        );
        resource.standardReportCardInputSubjectTypes.forEach(uuid => {
            reportCard.standardReportCardInputSubjectTypes.push(entityService.findByUUID(uuid, SubjectType.schema.name));
        });
        resource.standardReportCardInputPrograms.forEach(uuid => {
            reportCard.standardReportCardInputPrograms.push(entityService.findByUUID(uuid, Program.schema.name));
        });
        resource.standardReportCardInputEncounterTypes.forEach(uuid => {
            reportCard.standardReportCardInputEncounterTypes.push(entityService.findByUUID(uuid, EncounterType.schema.name));
        });
        reportCard.setStandardReportCardInputRecentDurationJSON(resource.standardReportCardInputRecentDuration);

        return reportCard;
    }

    isStandardTaskType() {
        return _.isNil(this.standardReportCardType) ? false : this.standardReportCardType.isTaskType();
    }

    isStandardReportType() {
        return !_.isNil(this.standardReportCardType);
    }

    isSubjectTypeFilterSupported() {
        return this.isStandardReportType() && this.standardReportCardType.isSubjectTypeFilterSupported();
    }

    isRecentType() {
        return this.isStandardReportType() && this.standardReportCardType.isRecentType();
    }

    hasInputForSubject() {
        return this.standardReportCardInputSubjectTypes.length > 0;
    }

    hasInputForEnrolment() {
        return this.standardReportCardInputPrograms.length > 0;
    }

    hasInputForProgramEncounter() {
        return this.hasInputForEnrolment() && this.standardReportCardInputEncounterTypes.length > 0;
    }

    hasInputForGeneralEncounter() {
        return this.standardReportCardInputEncounterTypes.length > 0;
    }

    createNestedErrorResults(primaryValue, secondaryValue) {
        const reportCard = this;
        return Array.from(Array(this.countOfCards).keys()).map(index => {
            const itemKey = reportCard.getCardId(index);
            return NestedReportCardResult.create(primaryValue, secondaryValue, false, true, itemKey);
        });
    }
}

export default ReportCard;
