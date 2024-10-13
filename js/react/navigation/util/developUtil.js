import { EnvironmentUrls } from 'Roblox';

const developLinkMdContainerId = 'header-develop-md-link';
const developLinkSmContainerId = 'header-develop-sm-link';

const initializeDevelopLink = () => {
  const developLinkMd = document.getElementById(developLinkMdContainerId);
  const developLinkSm = document.getElementById(developLinkSmContainerId);
  if (developLinkMd !== null) {
    developLinkMd.href = `https://create.${EnvironmentUrls.domain}/`;
  }

  if (developLinkSm !== null) {
    developLinkSm.href = `https://create.${EnvironmentUrls.domain}/`;
  }
};

export default { initializeDevelopLink };
