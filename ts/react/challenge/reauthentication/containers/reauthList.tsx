import React from 'react';
import { Modal } from 'react-style-guide';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import { ReauthListItem, ReauthListItemProps } from '../components/reauthListItem';
import useReauthenticationContext from '../hooks/useReauthenticationContext';

type Props = {
  listItemConfig: ReauthListItemProps[];
};

const ReauthList: React.FC<Props> = ({ listItemConfig }) => {
  const {
    state: { resources, renderInline }
  } = useReauthenticationContext();

  const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
  const lockIconClassName = renderInline ? 'inline-challenge-lock-icon' : 'modal-lock-icon';
  const marginBottomXLargeClassName = renderInline
    ? 'inline-challenge-margin-bottom-xlarge'
    : 'modal-margin-bottom-xlarge';
  const tableMarginClassName = renderInline ? '' : 'modal-margin-bottom-large';

  return (
    <BodyElement>
      <div className={lockIconClassName} />
      <p className={marginBottomXLargeClassName}>{resources.Label.ChooseVerificationMethod}</p>
      <table className={`table table-striped media-type-list ${tableMarginClassName}`}>
        <tbody>
          {listItemConfig.map(config => (
            <ReauthListItem
              key={config.rowLabel}
              rowLabel={config.rowLabel}
              rowIcon={config.rowIcon}
              requestInFlight={config.requestInFlight}
              typeToBeSelected={config.typeToBeSelected}
            />
          ))}
        </tbody>
      </table>
    </BodyElement>
  );
};

export default ReauthList;
