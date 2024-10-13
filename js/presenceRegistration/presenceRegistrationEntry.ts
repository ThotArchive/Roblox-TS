import './legacy/constants/bootstrapData';
import './legacy/services/presenceService';
import './legacy/actions/userInteraction';
import init from './userHeartbeats/userHeartbeatsEntry';

init().catch(console.error);
