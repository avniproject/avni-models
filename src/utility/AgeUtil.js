import Duration from "../Duration";
import moment from "moment";
import _ from "lodash";

class AgeUtil {
 static getDisplayAge(dateOfBirth, i18n) {
   //Keeping date of birth to be always entered and displayed as per the current date. It would be perhaps more error prone for users to put themselves in the past and enter age as of that date
   const ageInYears = this.getAgeInYears(dateOfBirth);
   if (ageInYears < 1) {
     let ageInWeeks = this.getAgeInWeeks(dateOfBirth);
     return ageInWeeks === 0
       ? Duration.inDay(moment().diff(dateOfBirth, "days")).toString(i18n)
       : Duration.inWeek(ageInWeeks).toString(i18n);
   } else if (ageInYears < 2) {
     return Duration.inMonth(this.getAgeInMonths(dateOfBirth)).toString(i18n);
   } else if (ageInYears < 6) {
     let ageInMonths = this.getAgeInMonths(dateOfBirth);
     let noOfYears = _.toInteger(ageInMonths / 12);
     let noOfMonths = ageInMonths % 12;
     let durationInYears = `${Duration.inYear(noOfYears).toString(i18n)}`;
     if(noOfMonths > 0) return `${durationInYears} ${Duration.inMonth(noOfMonths).toString(i18n)}`
     return durationInYears;
   } else {
     return Duration.inYear(ageInYears).toString(i18n);
   }
 }

  static getAgeInYears(dateOfBirth, asOnDate = moment(), precise = false) {
    return this.getAgeIn(dateOfBirth, "years")(asOnDate, precise);
  }

  static getAgeInMonths(dateOfBirth, asOnDate = moment(), precise = false) {
    return this.getAgeIn(dateOfBirth, "months")(asOnDate, precise);
  }

  static getAgeInWeeks(dateOfBirth, asOnDate, precise) {
    return this.getAgeIn(dateOfBirth,"weeks")(asOnDate, precise);
  }

  static getAgeIn(dateOfBirth, unit) {
    return (asOnDate = moment(), precise = false) =>
      moment(asOnDate).diff(dateOfBirth, unit, precise);
  }
}

export default AgeUtil;
