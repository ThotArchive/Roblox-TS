/*
 * Visible Challenge Constants
 */

// Minimum duration (ms) between logged mousemove events.
export const mousePositionThrottleInterval = 20;
// Maximum length of array logging mousemove events.
export const maxMousePositionArrayLength = 100;
// Delay (ms) between confirming and submitting solution to collect more
// mouse movement data.
export const checkAnswerDelay = 200;

/*
 * Frontend Effects
 */

// Delay between challenge complete and modal close in ms.
export const modalCloseDelay = 2000;

// ChallengeId key to prevent component from calling initializing multiple times.
export const challengeIdKey = 'RostileChallengeId';
