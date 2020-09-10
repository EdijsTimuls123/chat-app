import {DUPLICATE_USERNAME_CODE, INACTIVITY_TIMEOUT_CODE, SERVER_ERROR_CODE, SERVER_SHUTDOWN} from './Constants'

export const getErrorCodeMessageFromServer = (error) => {
    let messageToDisplay = ""
    switch(error.code) {
      case DUPLICATE_USERNAME_CODE:
        messageToDisplay = error.message
        break;
      case INACTIVITY_TIMEOUT_CODE:
        messageToDisplay = error.message
        break;
      case SERVER_ERROR_CODE:
        messageToDisplay = error.message
        break;
      case SERVER_SHUTDOWN:
        messageToDisplay = error.message
        break;
      default:
        return;
    }
    return messageToDisplay
};