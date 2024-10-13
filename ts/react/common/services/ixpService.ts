import { ExperimentationService } from 'Roblox';

export const getExperimentsForLayer = async (
  experimentLayer: string
): Promise<{ [parameter: string]: unknown }> => {
  if (ExperimentationService?.getAllValuesForLayer) {
    const ixpResult = await ExperimentationService.getAllValuesForLayer(experimentLayer);
    return ixpResult;
  }
  return {};
};

export default getExperimentsForLayer;
