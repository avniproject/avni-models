import BaseEntity from "./BaseEntity";
import _ from "lodash";
import General from "./utility/General";

class SyncTelemetry extends BaseEntity {
  static schema = {
    name: "SyncTelemetry",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      appVersion: "string",
      androidVersion: "string",
      deviceName: "string",
      syncStatus: "string",
      syncStartTime: "date",
      syncEndTime: "date?",
      entityStatus: "string",
      syncSource: 'string?',
      deviceInfo: "string",
      appInfo: "string"
    },
  };

   constructor(that = null) {
    super(that);
  }

  get appVersion() {
      return this.that.appVersion;
  }

  set appVersion(x) {
      this.that.appVersion = x;
  }

  get androidVersion() {
      return this.that.androidVersion;
  }

  set androidVersion(x) {
      this.that.androidVersion = x;
  }

  get deviceName() {
      return this.that.deviceName;
  }

  set deviceName(x) {
      this.that.deviceName = x;
  }

  get syncStatus() {
      return this.that.syncStatus;
  }

  set syncStatus(x) {
      this.that.syncStatus = x;
  }

  get syncStartTime() {
      return this.that.syncStartTime;
  }

  set syncStartTime(x) {
      this.that.syncStartTime = x;
  }

  get syncEndTime() {
      return this.that.syncEndTime;
  }

  set syncEndTime(x) {
      this.that.syncEndTime = x;
  }

  get entityStatus() {
      return this.that.entityStatus;
  }

  set entityStatus(x) {
      this.that.entityStatus = x;
  }

  get syncSource() {
      return this.that.syncSource;
  }

  set syncSource(x) {
      this.that.syncSource = x;
  }

  get deviceInfo() {
      return this.that.deviceInfo;
  }

  set deviceInfo(x) {
      this.that.deviceInfo = x;
  }

  get appInfo() {
      return this.that.appInfo;
  }

  set appInfo(x) {
      this.that.appInfo = x;
  }

  static fromResource() {
    throw new Error(
      "This should never be called because server always returns an empty array for this resource"
    );
  }

  static newInstance(allEntitiesMetaData) {
    const syncTelemetry = new SyncTelemetry();
    syncTelemetry.uuid = General.randomUUID();
    syncTelemetry.syncStartTime = new Date();
    syncTelemetry.syncStatus = "incomplete";
    const initialEntityStatus = {
      push: allEntitiesMetaData.map((e) => ({
        entity: e.entityName,
        todo: 0,
        done: 0,
      })),
      pull: allEntitiesMetaData.map((e) => ({
        entity: e.entityName,
        todo: 0,
        done: 0,
      })),
    };
    syncTelemetry.setEntityStatus(initialEntityStatus);
    return syncTelemetry;
  }

  setEntityStatus(statusObject) {
    this.entityStatus = JSON.stringify(statusObject);
  }

  getEntityStatus() {
    return JSON.parse(this.entityStatus);
  }

  getDeviceInfo() {
    //Data will   be fixed in the next release for this.
    return this.deviceInfo === '' ? {}: JSON.parse(this.deviceInfo);
  }

  getAppInfo() {
    return JSON.parse(this.appInfo);
  }

  get toResource() {
    const resource = _.pick(this, [
      "uuid",
      "syncStatus",
      "syncStartTime",
      "syncEndTime",
      "appVersion",
      "androidVersion",
      "deviceName",
      "syncSource"
    ]);
    resource.entityStatus = this.getEntityStatus();
    resource.deviceInfo = this.getDeviceInfo();
    resource.appInfo = this.getAppInfo();
    return resource;
  }

  clone() {
    const syncTelemetry = new SyncTelemetry();
    syncTelemetry.uuid = this.uuid;
    syncTelemetry.syncStatus = this.syncStatus;
    syncTelemetry.syncStartTime = this.syncStartTime;
    syncTelemetry.syncEndTime = this.syncEndTime;
    syncTelemetry.entityStatus = this.entityStatus;
    syncTelemetry.createdAt = this.createdAt;
    syncTelemetry.appVersion = this.appVersion;
    syncTelemetry.androidVersion = this.androidVersion;
    syncTelemetry.deviceName = this.deviceName;
    syncTelemetry.deviceInfo = this.deviceInfo;
    syncTelemetry.appInfo = this.appInfo;
    syncTelemetry.syncSource = this.syncSource;
    return syncTelemetry;
  }
}

export default SyncTelemetry;
