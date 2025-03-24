import { SearchLandingServiceInterface } from './interface';
import { ModalEvent } from './modalConstants';

function mountSearchLanding(): Promise<void> {
  return new Promise(() => {
    const event = new CustomEvent(ModalEvent.MountSearchLanding, {
      detail: {}
    });
    window.dispatchEvent(event);
  });
}

function showSearchLanding(sessionInfo: string): Promise<void> {
  return new Promise(() => {
    const event = new CustomEvent(ModalEvent.ShowSearchLanding, {
      detail: { sessionInfo }
    });
    window.dispatchEvent(event);
  });
}

function updateSessionInfo(sessionInfo: string): Promise<void> {
  return new Promise(() => {
    const event = new CustomEvent(ModalEvent.UpdateSearchSessionInfo, {
      detail: {
        sessionInfo
      }
    });
    window.dispatchEvent(event);
  });
}

// Called from the SearchLandingPageOmniFeed (Roblox.Games.WebApp) and subscribed to by SearchInput (Roblox.Navigation.WebApp)
function setSearchLandingHasContent(): Promise<void> {
  return new Promise(() => {
    const event = new CustomEvent(ModalEvent.SetSearchLandingHasContent, {});
    window.dispatchEvent(event);
  });
}

const SearchLandingService: SearchLandingServiceInterface = {
  mountSearchLanding,
  showSearchLanding,
  updateSessionInfo,
  setSearchLandingHasContent
};

export default SearchLandingService;
