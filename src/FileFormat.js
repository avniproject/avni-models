import {findKey, map} from "lodash";

const fileFormat = Object.freeze({
    "Portable Document Format (.pdf)": "application/pdf",
    "Text (.txt)": "text/plain",
    "Microsoft Word (.doc)": "application/msword",
    "Microsoft Word (.docx)": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Microsoft Excel (.xls)": "application/vnd.ms-excel",
    "Microsoft Excel (.xlsx)": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "OpenDocument spreadsheet document (.ods)": "application/vnd.oasis.opendocument.spreadsheet",
    "OpenDocument text document (.odt)": "application/vnd.oasis.opendocument.text",
});

export default class FileFormat {
    static get names() {
        return map(fileFormat, (value, key) => key);
    }

    static getType(name) {
        return fileFormat[name];
    }

    static getName(type) {
        return findKey(fileFormat, n => type === n);
    }
}
