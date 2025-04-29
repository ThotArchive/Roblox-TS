import chatModule from '../chatModule';

function abuseReport(resources) {
  'ngInject';

  return {
    restrict: 'A',
    templateUrl: resources.templates.abuseReportTemplate
  };
}

chatModule.directive('abuseReport', abuseReport);

export default abuseReport;
