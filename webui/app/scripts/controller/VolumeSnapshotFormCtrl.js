angular.module('openattic')
  .controller('VolumeSnapshotFormCtrl', function($scope, $state, $filter, $stateParams, VolumeService,
    VolumeSnapshotService, PoolService, SizeParserService, poolCheckingService){
    'use strict';

    if(!$scope.selection){
      goToListView();
      return;
    }
    var item = $scope.selection.item;

    $scope.source = poolCheckingService.get($scope.selection);

    $scope.snap = {
      'volumeId': item.id,
      'name': $filter('date')(new Date(), 'yyyy-MM-dd-HH-mm-ss'),
      'megs':  ''
    };

    $scope.megs = item.usage.size_text;

    $scope.$watch('megs', function(megs){
      $scope.snap.megs = SizeParserService.parseInt(megs);
    });

    $scope.submitAction = function(snapForm) {
      $scope.submitted = true;
      if(snapForm.$valid === true) {
        new VolumeSnapshotService($scope.snap)
          .$save()
          .then(function () {
            goToListView();
          }, function (error) {
            console.log('An error occured', error);
          });
      }
    };

    $scope.cancelAction = function() {
      goToListView();
    };

    var goToListView = function() {
      $state.go('volumes.detail.snapshots');
    };
  });

// kate: space-indent on; indent-width 2; replace-tabs on;
