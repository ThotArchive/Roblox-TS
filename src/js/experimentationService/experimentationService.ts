import { EnvironmentUrls, EventStream, Cookies, CurrentUser } from 'Roblox';
import { AxiosResponse, httpService } from 'core-utilities';
import {
  DEFAULT_ROBLOX_PROJECT,
  EXPOSED_EVENT_NAME,
  EXPOSURE_LOGGING_LAYER_NAME_KEY,
  EXPOSURE_LOGGING_EXPERIMENT_NAME_KEY,
  EXPOSURE_LOGGING_IS_AUDIENCE_SPECIFIED_KEY,
  EXPOSURE_LOGGING_IS_AUDIENCE_MEMBER_KEY,
  EXPOSURE_LOGGING_USER_AGENT_KEY,
  EXPOSURE_LOGGING_PLATFORM_TYPE_KEY,
  EXPOSURE_LOGGING_PLATFORM_TYPE_ID_KEY,
  EXPOSURE_LOGGING_ASSIGNED_SEGMENT_KEY,
  EXPOSURE_LOGGING_ASSIGNED_EXPERIMENT_VARIABLES_VARIANT_KEY,
  EXPOSURE_LOGGING_PRIMARY_UNIT_VARIABLE_KEY,
  EXPOSURE_LOGGING_PRIMARY_UNIT_VALUE_KEY,
  EXPOSURE_LOGGING_PRIMARY_UNIT_ALLOC_VARIABLE_KEY,
  EXPOSURE_LOGGING_PRIMARY_UNIT_ALLOC_VALUE_KEY,
  EXPOSURE_LOGGING_HOLDOUT_GROUP_EXPERIMENT_NAME_KEY,
  EXPERIMENTATION_TARGET_NAME
} from './experimentationConstants';
import { BulkEnrollmentResponse } from './models/bulkEnrollmentResponse';

export default class ExperimentationService {
  private projectLayerMetadataMaps: Array<Map<string, BulkEnrollmentResponse>>;

  constructor() {
    this.projectLayerMetadataMaps = [];
  }

  public getAllValuesForLayer(
    layerName: string,
    projectId = DEFAULT_ROBLOX_PROJECT
  ): Promise<{ [parameter: string]: unknown }> {
    // Build request to IXP
    const urlConfig = {
      url: `${EnvironmentUrls.apiGatewayUrl}/product-experimentation-platform/v1/projects/${projectId}/values`,
      withCredentials: true
    };

    const requestBody = {
      layers: {
        [layerName]: {}
      }
    };

    return httpService
      .post<BulkEnrollmentResponse>(urlConfig, requestBody)
      .then((response: AxiosResponse<BulkEnrollmentResponse>) => {
        if (response?.data) {
          // Parse layer parameters out of bulk enrollment response
          const bulkEnrollmentResponse: BulkEnrollmentResponse = response?.data;

          const layerMetadataMap =
            this.projectLayerMetadataMaps[projectId] ?? new Map<string, BulkEnrollmentResponse>();
          this.projectLayerMetadataMaps[projectId] = layerMetadataMap;

          // Map bulk enrollment response to layer name for use in
          // logLayerExposure if user is assigned to an experiment
          const assignedExperiment = bulkEnrollmentResponse.layers[layerName].experimentName;
          if (assignedExperiment) {
            layerMetadataMap.set(layerName, bulkEnrollmentResponse);
          }

          return bulkEnrollmentResponse.layers[layerName].parameters;
        }
        return Promise.reject();
      });
  }

  public logLayerExposure(layerName: string, projectId = DEFAULT_ROBLOX_PROJECT): void {
    // Read bulk enrollment response associated with this layer name
    const bulkEnrollmentResponse = this.projectLayerMetadataMaps[projectId]?.get(layerName);

    if (bulkEnrollmentResponse) {
      const bulkEnrollmentLayerResponse = bulkEnrollmentResponse.layers[layerName];
      const userId = CurrentUser.isAuthenticated ? CurrentUser.userId : 0;
      const cookieResult = Cookies.getBrowserTrackerId();
      const browserTrackerId = typeof cookieResult === 'number' ? cookieResult : 0;

      // Build base event
      const baseEvent: { [param: string]: string } = {
        uid: userId?.toString(),
        btid: browserTrackerId?.toString(),
        project: bulkEnrollmentResponse.projectId?.toString(),
        version: bulkEnrollmentResponse.version?.toString(),
        ts: Date.now().toString(), // The timestamp (ms since Unix epoch)
        lt: new Date().toISOString(), // The last timestamp (ISO date string)
        target: EXPERIMENTATION_TARGET_NAME
      };

      // Build exposure event with data from bulk enrollment response and bulk enrollment layer response
      const exposureEvent: { [param: string]: string } = {
        [EXPOSURE_LOGGING_LAYER_NAME_KEY]: layerName,
        [EXPOSURE_LOGGING_EXPERIMENT_NAME_KEY]: bulkEnrollmentLayerResponse.experimentName,
        [EXPOSURE_LOGGING_IS_AUDIENCE_SPECIFIED_KEY]: bulkEnrollmentLayerResponse.isAudienceSpecified?.toString(),
        [EXPOSURE_LOGGING_IS_AUDIENCE_MEMBER_KEY]: bulkEnrollmentLayerResponse.isAudienceMember?.toString(),
        [EXPOSURE_LOGGING_USER_AGENT_KEY]: bulkEnrollmentResponse.userAgent,
        [EXPOSURE_LOGGING_PLATFORM_TYPE_KEY]: bulkEnrollmentResponse.platformType,
        [EXPOSURE_LOGGING_PLATFORM_TYPE_ID_KEY]: bulkEnrollmentResponse.platformTypeId?.toString(),
        [EXPOSURE_LOGGING_ASSIGNED_SEGMENT_KEY]: bulkEnrollmentLayerResponse.segment?.toString(),
        [EXPOSURE_LOGGING_ASSIGNED_EXPERIMENT_VARIABLES_VARIANT_KEY]:
          bulkEnrollmentLayerResponse.experimentVariant,
        [EXPOSURE_LOGGING_PRIMARY_UNIT_VARIABLE_KEY]: bulkEnrollmentLayerResponse.primaryUnit,
        [EXPOSURE_LOGGING_PRIMARY_UNIT_VALUE_KEY]: bulkEnrollmentLayerResponse.primaryUnitValue?.toString(),
        [EXPOSURE_LOGGING_PRIMARY_UNIT_ALLOC_VARIABLE_KEY]: bulkEnrollmentLayerResponse.primaryUnit,
        [EXPOSURE_LOGGING_PRIMARY_UNIT_ALLOC_VALUE_KEY]: bulkEnrollmentLayerResponse.primaryUnitValue?.toString(),
        [EXPOSURE_LOGGING_HOLDOUT_GROUP_EXPERIMENT_NAME_KEY]:
          bulkEnrollmentLayerResponse.holdoutGroupExperimentName
      };

      const combinedEvent = {
        ...baseEvent,
        ...exposureEvent
      };

      // Sanitize combined event
      Object.keys(combinedEvent).forEach(key => {
        combinedEvent[key] = combinedEvent[key] ?? '';
      });

      // Send to event stream
      EventStream.SendEventWithTarget(
        EXPOSED_EVENT_NAME,
        EXPERIMENTATION_TARGET_NAME,
        combinedEvent,
        EventStream.TargetTypes.WWW
      );
    }
  }
}
