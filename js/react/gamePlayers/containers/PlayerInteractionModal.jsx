import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-style-guide';
import playerConstants from '../constants/playerConstants';
import CurrentPlayingGame from '../components/CurrentPlayingGame';
import ListOfPlayersInGame from '../components/ListOfPlayersInGame';

function PlayerInteractionModal({ friendsData, friendsInGame, game, dismissModal, translate }) {
  const modalTitle = translate(playerConstants.playerInteractionTitle);

  return (
    <div data-testid='game-players-player-interaction-modal'>
      <Modal.Header title={modalTitle} onClose={dismissModal} />
      <CurrentPlayingGame game={game} translate={translate} />
      <ListOfPlayersInGame
        friendsData={friendsData}
        friendsInGame={friendsInGame}
        dismissModal={dismissModal}
        isPlayable={game.isPlayable}
        translate={translate}
      />
    </div>
  );
}

PlayerInteractionModal.propTypes = {
  friendsData: PropTypes.arrayOf(
    PropTypes.shape({
      presense: PropTypes.shape({
        rootPlaceId: PropTypes.number,
        placeId: PropTypes.number,
        gameId: PropTypes.string
      }),
      id: PropTypes.number,
      nameForDisplay: PropTypes.string
    })
  ).isRequired,
  friendsInGame: PropTypes.arrayOf(PropTypes.number).isRequired,
  game: PropTypes.shape({
    universeId: PropTypes.number,
    placeId: PropTypes.number,
    name: PropTypes.string,
    playerCount: PropTypes.number,
    isShowSponsoredLabel: PropTypes.bool,
    nativeAdData: PropTypes.string,
    imageUrl: PropTypes.string,
    referralUrl: PropTypes.string,
    isPlayable: PropTypes.bool
  }).isRequired,
  dismissModal: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired
};

export default PlayerInteractionModal;
