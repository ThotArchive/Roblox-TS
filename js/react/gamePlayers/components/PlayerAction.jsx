import React from 'react';
import PropTypes from 'prop-types';
import { playGameService } from 'core-roblox-utilities';
import { Button } from 'react-style-guide';
import playerConstants from '../constants/playerConstants';

function PlayerAction({ playerData, dismissModal, isPlayable, translate }) {
  const {
    presence: { rootPlaceId, placeId, gameId: gameInstanceId },
    id,
    nameForDisplay
  } = playerData;
  const joinGame = e => {
    const propertiesForEvent = {
      rootPlaceId,
      placeId
    };
    const playGameProperties = playGameService.buildPlayGameProperties(
      rootPlaceId,
      placeId,
      gameInstanceId,
      id
    );
    const {
      eventStreamParams: { joinGameInPlacesList, gamePlayIntentInPlacesList }
    } = playerConstants;
    const eventStreamProperties = {
      eventName: joinGameInPlacesList.name,
      ctx: joinGameInPlacesList.ctx,
      properties: propertiesForEvent,
      gamePlayIntentEventCtx: gamePlayIntentInPlacesList.ctx
    };
    playGameService.launchGame(playGameProperties, eventStreamProperties);
    dismissModal(e);
  };

  return (
    <div className='border-bottom player-info'>
      <span className='player-name'>{nameForDisplay}</span>
      <Button
        className='cursor-pointer btn-primary-sm player-action'
        onClick={joinGame}
        isDisabled={!isPlayable}>
        {translate(playerConstants.joinGame)}
      </Button>
    </div>
  );
}

PlayerAction.propTypes = {
  playerData: PropTypes.shape({
    presence: PropTypes.shape({
      rootPlaceId: PropTypes.number,
      placeId: PropTypes.number,
      gameId: PropTypes.string
    }),
    id: PropTypes.number,
    nameForDisplay: PropTypes.string
  }).isRequired,
  dismissModal: PropTypes.func.isRequired,
  isPlayable: PropTypes.bool.isRequired,
  translate: PropTypes.func.isRequired
};

export default PlayerAction;
