import Duration from "./Duration";
import _ from "lodash";

class CompositeDuration {
  constructor(durations) {
    this.durations = durations;
  }

  changeValue(duration, value) {
    return new CompositeDuration(
      this.durations.map((d) =>
        d.durationUnit === duration.durationUnit ? d.changeValue(value) : d
      )
    );
  }

  findByUnit(durationUnit) {
    return _.find(this.durations, (d) => d.durationUnit === durationUnit);
  }

  changeValueByUnit(durationUnit, value) {
    return new CompositeDuration(
      this.durations.map((d) => (d.durationUnit === durationUnit ? d.changeValue(value) : d))
    );
  }

  get isEmpty() {
    return this.durations.every((d) => d.isEmpty);
  }

  toString(i18n) {
    return this.durations.map((d) => d.toString(i18n)).join(" ");
  }

  cloneForEdit() {
    return new CompositeDuration(this.durations.map((d) => d.cloneForEdit()));
  }

  getValue() {
    return this;
  }

  static fromOpts(durationOptions) {
    return new CompositeDuration(durationOptions.map((opt) => new Duration(null, opt)));
  }

  get toResource() {
    const isoCompositeDuration = this.durations.map((d) => d.toISO).join("");
    const firstOccurrenceIndex = isoCompositeDuration.search("T") + 1;
    return (
      "P" +
      isoCompositeDuration.substr(0, firstOccurrenceIndex) +
      isoCompositeDuration.slice(firstOccurrenceIndex).replace(/T/g, "")
    );
  }

  static fromObs(obs) {
    if (typeof obs === "string") {
      return new CompositeDuration(Duration.fromIsoObs(obs));
    } else if (_.isNil(obs.durations)) {
      return new CompositeDuration(obs.map(Duration.fromObs));
    }
    return new CompositeDuration(obs.durations.map(Duration.fromObs));
  }
}

export default CompositeDuration;
