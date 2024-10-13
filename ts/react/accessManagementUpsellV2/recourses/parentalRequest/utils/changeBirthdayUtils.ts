import parentalRequestConstants from '../constants/parentalRequestConstants';

const changeBirthdayUtils = {
  calculateAge: (date: Date): number => {
    const nowWithoutHours = new Date().toISOString().split('T')[0]; // get current date without hours
    const ageDifferenceMills = new Date(nowWithoutHours).getTime() - date.getTime(); // milliseconds from epoch
    const ageDate = new Date(ageDifferenceMills);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  },
  getAgeRange: (date: Date): string => {
    const { changeBirthday } = parentalRequestConstants.events.state;
    const age = changeBirthdayUtils.calculateAge(date);
    if (age < 13) {
      return changeBirthday.U13ToU13;
    }
    return changeBirthday.U13To1318;
  }
};
export default changeBirthdayUtils;
