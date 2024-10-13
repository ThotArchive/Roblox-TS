import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translationConfig } from './translation.config';
import userAgreementsService from './services/userAgreementsService';
import UserAgreementsChecker from './components/UserAgreementsChecker';
import cachedAgreementUtils from './utils/agreementCacheUtils';

const App = ({ translate }) => {
  const [userAgreements, setUserAgreements] = useState([]);

  useEffect(() => {
    const now = new Date();

    const fetchUserAgreements = async () => {
      let shouldFetchAgreements = false;

      try {
        shouldFetchAgreements = await cachedAgreementUtils.shouldFetchAgreements(now);
      } catch (error) {
        console.error(`Error calling shouldFetchAgreements ${error}`);
      }

      if (shouldFetchAgreements) {
        try {
          const newAgreementsResponse = await userAgreementsService.getOutstandingUserAgreements();
          setUserAgreements(newAgreementsResponse.data);

          // Locally cache whether the user has agreements to accept
          if (newAgreementsResponse.data.length > 0) {
            cachedAgreementUtils.updateDoesUserNeedToAcceptAgreements(true, now);
          } else {
            cachedAgreementUtils.updateDoesUserNeedToAcceptAgreements(false, now);
          }
        } catch (error) {
          console.error(`Error fetching or caching user agreements ${error}`);
        }
      }
    };

    fetchUserAgreements();
  }, []);

  if (userAgreements.length > 0) {
    return <UserAgreementsChecker translate={translate} agreements={userAgreements} />;
  }

  return null;
};

App.propTypes = {
  translate: PropTypes.func.isRequired
};

// Export App separately for testing purposes
export { App as TestApp };

export default withTranslations(App, translationConfig);
