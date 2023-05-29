import _ from "lodash";
import {assert} from 'chai';
import Settings from "../src/Settings";
import LocaleMapping from "../src/LocaleMapping";

describe('Settings', () => {
    it('validates against bad values in Settings', () => {
        const settings = new Settings();
        let localeMapping = new LocaleMapping();
        localeMapping.locale = 'en';
        _.assignIn(settings, {
            uuid: '54bee5ab-3b5b-43ce-872e-5036a26d8751',
            serverURL: 'http://localhost:8000',
            logLevel: 1,
            locale: localeMapping,
            idpType: 'none'
        });

        let validationResult = settings.validate();
        assert.isFalse(validationResult.hasValidationError());
        assert.isTrue(validationResult.resultFor('logLevel').success);
        assert.isTrue(validationResult.resultFor('serverURL').success);
    });
});
