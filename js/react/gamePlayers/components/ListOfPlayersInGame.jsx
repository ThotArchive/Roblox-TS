import React from 'react';
import PropTypes from 'prop-types';
import PlayerAvatar from './PlayerAvatar';
import PlayerAction from './PlayerAction';

function ListOfPlayersInGame({ friendsData, friendsInGame, dismissModal, isPlayable, translate }) {
  const friendsObj = {};
  friendsData.forEach(friend => {
    friendsObj[friend.id] = friend;
  });
  return (
    <div className='interaction-container'>
      <ul className='interaction-list'>
        {friendsInGame.map((friendId, idx) => {
          const keyValue = friendId + idx;
          const friend = friendsObj[friendId];
          const { id, nameForDisplay } = friend;
          return (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <li key={keyValue} className='interaction-item' aria-hidden='true'>
              <span className='avatar avatar-headshot avatar-headshot-sm player-avatar'>
                <PlayerAvatar playerId={id} altName={nameForDisplay} />
              </span>
              <PlayerAction
                playerData={friend}
                dismissModal={dismissModal}
                isPlayable={isPlayable}
                translate={translate}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

ListOfPlayersInGame.propTypes = {
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
  dismissModal: PropTypes.func.isRequired,
  isPlayable: PropTypes.bool.isRequired,
  translate: PropTypes.func.isRequired
};

export default ListOfPlayersInGame;
