import React, { useEffect, useState } from 'react';
import { withTranslations } from 'react-utilities';
import PropTypes from 'prop-types';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import translationConfig from '../translation.config';

const { resources } = itemPurchaseConstants;

function Timer({ translate, offSaleDeadline }) {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    let intervalId = 0;
    const runCountdown = () => {
      if (new Date() < new Date(offSaleDeadline)) {
        const currentTime = +new Date();
        const offSaleDateTime = new Date(offSaleDeadline);
        const diff = (offSaleDateTime.getTime() - currentTime) / 1000;
        setDays(Math.floor(diff / (60 * 60 * 24)));
        setHours(Math.floor((diff / 3600) % 24));
        setMinutes(Math.floor((diff / 60) % 60));
        setSeconds(Math.floor(diff % 60));
      }
    };
    runCountdown();
    intervalId = setInterval(runCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [setDays, setHours, setMinutes, setSeconds]);

  const setupSaleCountdownTimer = () => {
    if (days < 1) {
      const timerInfoHours = {
        numberOfHours: hours,
        numberOfMinutes: minutes,
        numberOfSeconds: seconds
      };
      return (
        <div
          className='text'
          dangerouslySetInnerHTML={{
            __html: translate(resources.OffsaleCountdownHourMinuteSecondLabel, timerInfoHours)
          }}
        />
      );
    }
    if (seconds < 1) {
      window.location.reload();
      return null;
    }
    const timerInfoDays = {
      numberOfDays: days,
      numberOfHours: hours,
      numberOfMinutes: minutes
    };
    return (
      <div
        className='text'
        dangerouslySetInnerHTML={{
          __html: translate(resources.CountdownTimerDayHourMinute, timerInfoDays)
        }}
      />
    );
  };

  return (
    <div id='sale-clock' className='text-error sale-clock desktop-sale-clock'>
      {setupSaleCountdownTimer()}
    </div>
  );
}

Timer.propTypes = {
  translate: PropTypes.func.isRequired,
  offSaleDeadline: PropTypes.string.isRequired
};

export default withTranslations(Timer, translationConfig.itemResources);
