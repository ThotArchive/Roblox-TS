import ExperimentationService from './experimentationService/experimentationService';

// This file exposes the Experimentation Service to the global Roblox object

if (typeof window.Roblox === 'undefined') {
  window.Roblox = {};
}

if (typeof window.Roblox.ExperimentationService === 'undefined') {
  window.Roblox.ExperimentationService = new ExperimentationService();
}

export default ExperimentationService;
