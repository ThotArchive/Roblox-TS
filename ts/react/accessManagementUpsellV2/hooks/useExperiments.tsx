import { ExperimentationService } from 'Roblox';

import { useEffect, useState } from 'react';

const getExperimentsForLayer = async (
  experimentLayer: string
): Promise<{ [parameter: string]: unknown }> => {
  if (ExperimentationService?.getAllValuesForLayer) {
    const ixpResult = await ExperimentationService.getAllValuesForLayer(experimentLayer);

    return ixpResult;
  }

  return {};
};

const useExperiments = (experimentLayer: string): { [experimentName: string]: unknown } => {
  const [ixpResult, setIxpResult] = useState({});

  useEffect(() => {
    getExperimentsForLayer(experimentLayer).then(
      function success(data) {
        setIxpResult(data);
      },

      function error() {
        // return empty object if call to experimentation service fails

        // this behaves as if user is not enrolled in any experiment

        setIxpResult({});
      }
    );
  }, [experimentLayer]);

  return ixpResult;
};

export default useExperiments;
