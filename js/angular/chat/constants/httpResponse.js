import chatModule from '../chatModule';

const httpResponse = {
  sendMessageErrorCode: {
    textTooLong: 'TextTooLong'
  }
};

chatModule.constant('httpResponse', httpResponse);

export default httpResponse;
