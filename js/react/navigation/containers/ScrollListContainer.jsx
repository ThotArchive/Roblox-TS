import { authenticatedUser } from 'header-scripts';
import React, { useState, useEffect } from 'react';
import navigationService from '../services/navigationService';
import ScrollList from '../components/ScrollList';
import navigationUtil from '../util/navigationUtil';

function ScrollListContainer(props) {
  const { isAuthenticated } = authenticatedUser;
  const [friendsData, setFriendsData] = useState({});
  const [messagesData, setMessagesData] = useState({});
  const [tradeData, setTradeData] = useState({});

  useEffect(() => {
    const handleFriendsEvent = () => {
      navigationService.getFriendsRequestCount().then(
        ({ data: friendsRequestCountData }) => {
          setFriendsData(friendsRequestCountData);
        },
        error => {
          console.debug(error);
        }
      );
    };
    const handleMessagesEvent = () => {
      navigationService
        .getUnreadPrivateMessagesCount()
        .then(({ data: unreadPrivateMessageData }) => {
          setMessagesData(unreadPrivateMessageData);
        });
    };
    let unsubscribeToFriendsNotifications = () => {};
    let unsubscribeToMessagessNotifications = () => {};
    if (isAuthenticated) {
      unsubscribeToFriendsNotifications = navigationUtil.subscribeToFriendsNotifications(
        handleFriendsEvent
      );
      unsubscribeToMessagessNotifications = navigationUtil.subscribeToMessagesNotifications(
        handleMessagesEvent
      );
      navigationService.getFriendsRequestCount().then(
        ({ data: friendsRequestCountData }) => {
          setFriendsData(friendsRequestCountData);
        },
        error => {
          console.debug(error);
        }
      );
      navigationService.getUnreadPrivateMessagesCount().then(
        ({ data: unreadPrivateMessageData }) => {
          setMessagesData(unreadPrivateMessageData);
        },
        error => {
          console.debug(error);
        }
      );
      navigationService.getTradeStatusCount().then(
        ({ data: tradeCountData }) => {
          setTradeData(tradeCountData);
        },
        error => {
          console.debug(error);
        }
      );
    }
    return () => {
      unsubscribeToFriendsNotifications();
      unsubscribeToMessagessNotifications();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ScrollList {...{ friendsData, messagesData, tradeData, ...props }} />;
}

export default ScrollListContainer;
