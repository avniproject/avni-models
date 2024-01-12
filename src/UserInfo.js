import _ from "lodash";
import BaseEntity from "./BaseEntity";

class UserInfo extends BaseEntity {
    static UUID = "ce9ad8ee-193e-49ee-8626-49802c8b4bd7";
    static DEFAULT_SETTINGS = '{"trackLocation": false, "locale": "en", "disableAutoRefresh": false, "disableAutoSync": false}';

    static schema = {
        name: "UserInfo",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            username: "string",
            organisationName: "string",
            settings: "string",
            name: {type: "string", optional: true},
            syncSettings: {type: "string", optional: true},
            userUUID: {type: "string", optional: true}
        },
    };

    constructor(that = null) {
        super(that);
    }

    get username() {
        return this.that.username;
    }

    set username(x) {
        this.that.username = x;
    }

    get organisationName() {
        return this.that.organisationName;
    }

    set organisationName(x) {
        this.that.organisationName = x;
    }

    get settings() {
        return this.that.settings;
    }

    set settings(x) {
        this.that.settings = x;
    }

    get name() {
        return this.that.name;
    }

    set name(x) {
        this.that.name = x;
    }

    get syncSettings() {
        return this.that.syncSettings;
    }

    set syncSettings(x) {
        this.that.syncSettings = x;
    }

    get userUUID() {
        return this.that.userUUID;
    }

    set userUUID(x) {
        this.that.userUUID = x;
    }

    static fromResource(resource) {
        let userInfo = new UserInfo();
        userInfo.username = resource.username;
        userInfo.uuid = UserInfo.UUID;
        userInfo.organisationName = resource.organisationName;
        userInfo.settings = _.isNil(resource.settings)
            ? UserInfo.DEFAULT_SETTINGS
            : JSON.stringify(resource.settings);
        userInfo.name = resource.name;
        userInfo.syncSettings = _.isNil(resource.syncSettings) ? '{}' : JSON.stringify(resource.syncSettings);
        userInfo.userUUID = resource.userUUID;
        return userInfo;
    }

    setSettings(settingsObject) {
        this.settings = JSON.stringify(settingsObject);
    }

    getSettings() {
        return JSON.parse(this.settings);
    }

    getSyncSettings() {
        return JSON.parse(this.syncSettings);
    }

    getDisplayUsername() {
        return _.isNil(this.name) ? this.username : this.name;
    }

    get toResource() {
        const resource = _.pick(this, ["uuid"]);
        resource.settings = this.getSettings();
        return resource;
    }

    clone() {
        let userInfo = new UserInfo();
        userInfo.username = this.username;
        userInfo.uuid = this.uuid;
        userInfo.organisationName = this.organisationName;
        userInfo.settings = this.settings;
        userInfo.syncSettings = this.syncSettings;
        userInfo.name = this.name;
        return userInfo;
    }

    static createEmptyInstance() {
        const userInfo = new UserInfo();
        userInfo.settings = UserInfo.DEFAULT_SETTINGS;
        userInfo.syncSettings = '{}';
        return userInfo;
    }
}

export default UserInfo;
