import BaseEntity from "../BaseEntity";
import General from "../utility/General";
import moment from "moment";
import _ from "lodash";
import Video from "./Video";
import SchemaNames from "../SchemaNames";

class VideoTelemetric extends BaseEntity {
  static schema = {
    name: SchemaNames.VideoTelemetric,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      video: { type: 'object', objectType: 'Video' },
      playerOpenTime: "date",
      playerCloseTime: "date",
      videoStartTime: "double", //in seconds
      videoEndTime: "double", //in seconds
    },
  };

  constructor(that = null) {
    super(that);
  }

  get video() {
      return this.toEntity("video", Video);
  }

  set video(x) {
      this.that.video = this.fromObject(x);
  }

  get playerOpenTime() {
      return this.that.playerOpenTime;
  }

  set playerOpenTime(x) {
      this.that.playerOpenTime = x;
  }

  get playerCloseTime() {
      return this.that.playerCloseTime;
  }

  set playerCloseTime(x) {
      this.that.playerCloseTime = x;
  }

  get videoStartTime() {
      return this.that.videoStartTime;
  }

  set videoStartTime(x) {
      this.that.videoStartTime = x;
  }

  get videoEndTime() {
      return this.that.videoEndTime;
  }

  set videoEndTime(x) {
      this.that.videoEndTime = x;
  }

  static create(obj = {}) {
    const { uuid = General.randomUUID() } = obj;
    return _.assignIn(
      new VideoTelemetric(),
      _.pick(obj, [
        "uuid",
        "video",
        "playerOpenTime",
        "playerCloseTime",
        "videoStartTime",
        "videoEndTime",
      ]),
      { uuid }
    );
  }

  static fromResource() {
    General.logWarn(
      "This should never be called. The server should always return empty array.\n" +
        "So, no need to create realm entities."
    );
    return VideoTelemetric.create({});
  }

  cloneForReference() {
    return VideoTelemetric.create(_.assignIn({}, this));
  }

  setPlayerOpenTime() {
    this.playerOpenTime = moment().toDate();
  }

  setPlayerCloseTime() {
    this.playerCloseTime = moment().toDate();
  }

  setOnceVideoStartTime(videoTime) {
    if (_.isNil(this.videoStartTime)) {
      this.videoStartTime = this._roundToNearestPoint5(videoTime);
    }
  }

  setVideoEndTime(videoTime) {
    this.videoEndTime = this._roundToNearestPoint5(videoTime);
  }

  get toResource() {
    const resource = _.pick(this, ["uuid", "videoStartTime", "videoEndTime"]);
    resource.playerOpenTime = General.isoFormat(this.playerOpenTime);
    resource.playerCloseTime = General.isoFormat(this.playerCloseTime);
    resource.videoUUID = this.video.uuid;
    return resource;
  }

  //valid outputs 0,0.5,1,1.5,2,2.5,3,3.5...
  _roundToNearestPoint5(n) {
    return Math.round(n * 2) / 2;
  }
}

export default VideoTelemetric;
