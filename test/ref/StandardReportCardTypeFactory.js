import StandardReportCardType from "../../src/StandardReportCardType";

class StandardReportCardTypeFactory {
    static create({name, type}) {
        const standardReportCardType = new StandardReportCardType();
        standardReportCardType.name = name;
        standardReportCardType.type = type;
        return standardReportCardType;
    }
}

export default StandardReportCardTypeFactory;
