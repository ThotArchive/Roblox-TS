export const addDays = (curr, diff) => {
  const newDay = new Date(curr.toISOString());
  newDay.setDate(curr.getDate() + diff);
  return newDay;
};

export const subDays = (curr, diff) => addDays(curr, -diff);

export const addMonths = (curr, diff) => {
  const newDay = new Date(curr.toISOString());
  newDay.setMonth(curr.getMonth() + diff);
  return newDay;
};

export const subMonths = (curr, diff) => addMonths(curr, -diff);

export const addYears = (curr, diff) => {
  const newDay = new Date(curr.toISOString());
  newDay.setYear(curr.getFullYear() + diff);
  return newDay;
};

export const subYears = (curr, diff) => addYears(curr, -diff);

export const startOfToday = () => {
  const current = new Date();
  current.setHours(0, 0, 0, 0);
  return current;
};

export const endOfToday = () => {
  // return a Date object to 23:59:59:999 (local time)
  const current = new Date();
  current.setHours(23, 59, 59, 999);
  return current;
};

export const getUtcQueryString = localDate => {
  if (!localDate) {
    return "";
  }
  // return date string in UTC, YYYY-MM-DD format
  const utcMonth = (localDate.getUTCMonth() + 1).toString().padStart(2, "0");
  const utcDate = localDate.getUTCDate().toString().padStart(2, "0");
  const queryString = `${localDate.getUTCFullYear()}-${utcMonth}-${utcDate}`;
  return queryString;
};
