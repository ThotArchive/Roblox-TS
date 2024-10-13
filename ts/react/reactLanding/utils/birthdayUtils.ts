import { Intl } from 'Roblox';
import { urlService } from 'core-utilities';
import { TBirthdaySelect, TBirthdaySelectOption } from '../../common/types/signupTypes';
import {
  maxNumberOfDates,
  minSignUpAge,
  maxSignUpAge,
  birthdayPickerConstants,
  monthStrings,
  signupFormStrings,
  requestTypeParam,
  sessionIdParam
} from '../constants/signupConstants';
import {
  sendDayFocusEvent,
  sendDayOffFocusEvent,
  sendMonthFocusEvent,
  sendMonthOffFocusEvent,
  sendYearFocusEvent,
  sendYearOffFocusEvent,
  sendVPCSignupBirthdateFieldInteractedEvent
} from '../services/eventService';
import { isVerifiedParentConsentSignup } from './signupUtils';
import VerifiedParentalConsentRequestType from '../enums/VerifiedParentalConsentRequestType';

const intl = new Intl();

// VPC signup
const isVPCSignup = isVerifiedParentConsentSignup();
const requestType = urlService.getQueryParam(
  requestTypeParam
) as VerifiedParentalConsentRequestType | null;
const sessionId = urlService.getQueryParam(sessionIdParam) as string;

const getMonthList = (): TBirthdaySelectOption[] => {
  const months: TBirthdaySelectOption[] = [];
  for (let i = 0; i < 12; i++) {
    months[i] = { value: monthStrings[i].slice(6, 9), label: monthStrings[i] };
  }
  return months;
};

const getDateList = (): TBirthdaySelectOption[] => {
  const dates: TBirthdaySelectOption[] = [];
  const maximumDate = maxNumberOfDates;

  for (let i = 1; i <= maximumDate; i++) {
    // add leading zero (1 => 01 and 10 => 10)
    const day = `0${i}`.slice(-2);
    const i18nDay = {
      value: day,
      label: day
    };
    dates.push(i18nDay);
  }
  return dates;
};

const getYearList = (): TBirthdaySelectOption[] => {
  const years: TBirthdaySelectOption[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const minimumYear = currentYear - maxSignUpAge;

  // a user can only be minSignupAge years old, which excludes recent years
  const maxYear = currentYear - minSignUpAge;

  for (let i = maxYear; i > minimumYear; i--) {
    const year = String(i);
    const i18nYear = {
      value: year,
      label: year
    };
    years.push(i18nYear);
  }

  return years;
};

export const getOrderedBirthdaySelects = (
  day: string,
  month: string,
  year: string,
  onDayChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
  onMonthChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
  onYearChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
  dayRef: React.RefObject<HTMLSelectElement>,
  monthRef: React.RefObject<HTMLSelectElement>,
  yearRef: React.RefObject<HTMLSelectElement>
): TBirthdaySelect[] => {
  const orderedBirthdaySelects: TBirthdaySelect[] = [];
  const typeOrder: {
    month: number;
    day: number;
    year: number;
  } = intl.getDateTimeFormatter().getOrderedDateParts();
  const dayBirthdaySelect: TBirthdaySelect = {
    options: getDateList(),
    className: birthdayPickerConstants.day.class,
    idName: birthdayPickerConstants.day.id,
    birthdayName: birthdayPickerConstants.day.name,
    placeholder: signupFormStrings.Day,
    value: day,
    ref: dayRef,
    onChange: onDayChange,
    onFocus: isVPCSignup
      ? () =>
          sendVPCSignupBirthdateFieldInteractedEvent(
            requestType ?? VerifiedParentalConsentRequestType.Unknown,
            sessionId
          )
      : sendDayFocusEvent,
    onBlur: sendDayOffFocusEvent
  };
  const monthBirthdaySelect: TBirthdaySelect = {
    options: getMonthList(),
    className: birthdayPickerConstants.month.class,
    idName: birthdayPickerConstants.month.id,
    birthdayName: birthdayPickerConstants.month.name,
    placeholder: signupFormStrings.Month,
    value: month,
    ref: monthRef,
    onChange: onMonthChange,
    onFocus: isVPCSignup
      ? () =>
          sendVPCSignupBirthdateFieldInteractedEvent(
            requestType ?? VerifiedParentalConsentRequestType.Unknown,
            sessionId
          )
      : sendMonthFocusEvent,
    onBlur: sendMonthOffFocusEvent
  };
  const yearBirthdaySelect: TBirthdaySelect = {
    options: getYearList(),
    className: birthdayPickerConstants.year.class,
    idName: birthdayPickerConstants.year.id,
    birthdayName: birthdayPickerConstants.year.name,
    placeholder: signupFormStrings.Year,
    value: year,
    ref: yearRef,
    onChange: onYearChange,
    onFocus: isVPCSignup
      ? () =>
          sendVPCSignupBirthdateFieldInteractedEvent(
            requestType ?? VerifiedParentalConsentRequestType.Unknown,
            sessionId
          )
      : sendYearFocusEvent,
    onBlur: sendYearOffFocusEvent
  };
  orderedBirthdaySelects[typeOrder.day] = dayBirthdaySelect;
  orderedBirthdaySelects[typeOrder.month] = monthBirthdaySelect;
  orderedBirthdaySelects[typeOrder.year] = yearBirthdaySelect;

  return orderedBirthdaySelects;
};

export const getFirstDatePart = (): string => {
  const typeOrder = intl.getDateTimeFormatter().getOrderedDateParts();
  if (typeOrder.day === 0) {
    return birthdayPickerConstants.day.name;
  }
  if (typeOrder.month === 0) {
    return birthdayPickerConstants.month.name;
  }
  return birthdayPickerConstants.year.name;
};
