import { EnvironmentUrls } from 'Roblox';

const WORKER_COMPONENT = 'ChallengeWebWorkers';
const URL_NOT_FOUND = 'URL_NOT_FOUND';
const websiteUrl = EnvironmentUrls.websiteUrl ?? URL_NOT_FOUND;

const workerUrl = `${websiteUrl}/worker-resources/script/?component=${WORKER_COMPONENT}`;
export default (): Worker => new Worker(workerUrl);
