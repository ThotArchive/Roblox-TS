import parentalRequestConstants from '../constants/parentalRequestConstants';
import { TUserBirthdate } from '../../../types/UserTypes';

const changeBirthdayUtils = {
  dateInUTCToBirthdate: (date: Date): TUserBirthdate => {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    return {
      birthDay: day,
      birthMonth: month,
      birthYear: year
    };
  },
  calculateAge: (birthdate?: TUserBirthdate): number => {
    if (!birthdate || !birthdate.birthYear || birthdate.birthYear === 0) {
      return 0;
    }
    const now = new Date();
    const formattedTodaysDate = changeBirthdayUtils.dateInUTCToBirthdate(now);
    const diffInDays = formattedTodaysDate.birthDay - birthdate.birthDay;
    if (diffInDays < 0) {
      formattedTodaysDate.birthMonth -= 1;
    }
    const diffInMonths = formattedTodaysDate.birthMonth - birthdate.birthMonth;
    if (diffInMonths < 0) {
      formattedTodaysDate.birthYear -= 1;
    }
    const diffInYears = formattedTodaysDate.birthYear - birthdate.birthYear;
    return diffInYears;
  },
  getAgeRange: (date: Date): string => {
    const { changeBirthday } = parentalRequestConstants.events.state;
    const formattedTargetBirthdate = changeBirthdayUtils.dateInUTCToBirthdate(date);
    const age = changeBirthdayUtils.calculateAge(formattedTargetBirthdate);
    if (age < 13) {
      return changeBirthday.U13ToU13;
    }
    return changeBirthday.U13To1318;
  }
};
export default changeBirthdayUtils;
