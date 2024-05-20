import StandardReportCardType from "../../src/StandardReportCardType";

class StandardReportCardTypeFactory {
    static create({name}) {
        const standardReportCardType = new StandardReportCardType();
        standardReportCardType.name = name;
        return standardReportCardType;
    }
}

export default StandardReportCardTypeFactory;
