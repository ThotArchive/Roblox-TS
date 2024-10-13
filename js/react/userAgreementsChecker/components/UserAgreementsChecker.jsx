import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { createModal, Link } from 'react-style-guide';
import userAgreementsService from '../services/userAgreementsService';
import agreementConstants from '../constants/agreementConstants';
import cachedAgreementUtils from '../utils/agreementCacheUtils';

const [Modal, modalService] = createModal();

const UserAgreementsChecker = ({ translate, agreements }) => {
  const AgreementList = () => {
    const { agreementTypeToTextKey } = agreementConstants;
    const agreementItems = agreements.map(agreement => {
      return (
        <li key={agreement.id} className='agreement-item'>
          <Link url={agreement.displayUrl} target='_blank' rel='noreferrer' className='text-link'>
            {translate(agreementTypeToTextKey[agreement.agreementType])}
          </Link>
        </li>
      );
    });

    return <ul>{agreementItems}</ul>;
  };

  const AgreementListHeader = () => {
    const { agreementListHeaderTextKey } = agreementConstants;
    return <div>{translate(agreementListHeaderTextKey)}</div>;
  };

  const { modalTitleKey } = agreementConstants;
  const modalBody = (
    <div className='agreement-modal-body'>
      <AgreementListHeader />
      <AgreementList agreements={agreements} />
    </div>
  );
  const { acceptButtonTextKey } = agreementConstants;

  useEffect(() => {
    modalService.open();
  }, []);

  const onAccept = async () => {
    try {
      await userAgreementsService.insertAcceptances(agreements.map(agreement => agreement.id));
      // The user has accepted the agreements, so update the state of localStorage to reflect that.
      // However, we won't update the lastFetchTimestamp.
      cachedAgreementUtils.updateDoesUserNeedToAcceptAgreements(false);
    } catch (error) {
      console.error(`Error accepting user agreements ${error}`);
    }
  };

  return (
    <Modal
      title={translate(modalTitleKey)}
      body={modalBody}
      neutralButtonText={translate(acceptButtonTextKey)}
      onNeutral={onAccept}
      id='user-agreements-checker-modal'
      closeable={false}
    />
  );
};

UserAgreementsChecker.propTypes = {
  translate: PropTypes.func.isRequired,
  agreements: PropTypes.arrayOf(
    PropTypes.shape({
      displayUrl: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      agreementType: PropTypes.string.isRequired,
      clientType: PropTypes.string.isRequired,
      regulationType: PropTypes.string.isRequired
    })
  ).isRequired
};

export default UserAgreementsChecker;
