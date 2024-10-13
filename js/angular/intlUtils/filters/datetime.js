import { Intl } from 'Roblox';
import intlUtilsModule from '../intlUtilsModule';

function datetimeFilter() {
  // consumer of this filter should pass valid JS Date.
  return function datetime(date, params) {
    let dateTime;
    // null should be considered as "Invalid Date" because new Date(null) = Dec 31, 1969
    if (!date || date === null) {
      dateTime = 'Invalid Date';
    }
    // string may be a date string or UTC timestamp so we can create a new Date object from this
    else if (typeof date === 'string' || typeof date === 'number') {
      dateTime = new Date(date); // if date is invalid JS date string, date becomes an object with toString() of "Invalid Date"
    } else {
      dateTime = date; // assume date is already formatted as a Date object
    }
    if (dateTime.toString() !== 'Invalid Date') {
      const dateTimeFormatter = new Intl().getDateTimeFormatter();
      // filter will getFullDate, getShortDate, getCustomDateTime, or fall back to getShortDate by default
      if (params === 'full') {
        return dateTimeFormatter.getFullDate(dateTime);
      }
      if (params === 'short') {
        return dateTimeFormatter.getShortDate(dateTime);
      }
      if (params) {
        return dateTimeFormatter.getCustomDateTime(dateTime, params);
      }
      return dateTimeFormatter.getShortDate(dateTime);
    }
    return date; // if input date is not valid JS Date, just return that misconfigured input
  };
}

intlUtilsModule.filter('datetime', datetimeFilter);

export default datetimeFilter;
