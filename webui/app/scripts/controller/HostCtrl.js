/**
 *
 * @source: http://bitbucket.org/openattic/openattic
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2011-2016, it-novum GmbH <community@openattic.org>
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License as published by the Free Software
 * Foundation; version 2.
 *
 * This package is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * As additional permission under GNU GPL version 2 section 3, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 1, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */
"use strict";

var app = angular.module("openattic");
app.controller("HostCtrl", function ($scope, $state, HostService, $uibModal, InitiatorService, NetdeviceService,
    TabViewService) {
  $scope.data = {};

  $scope.filterConfig = {
    page: 0,
    entries: null,
    search: "",
    sortfield: null,
    sortorder: null
  };

  $scope.selection = {};

  $scope.loadInitiators = function () {
    return InitiatorService.get()
      .$promise
      .then(function (res) {
        $scope.shares = res.results;
      }, function (error) {
        console.log("An error occurred", error);
      });
  };

  $scope.loadNetdevices = function () {
    return NetdeviceService.get()
      .$promise
      .then(function (res) {
        $scope.devices = res.results;
      }, function (error) {
        console.log("An error occurred", error);
      });
  };

  $scope.loadHosts = function () {
    return HostService.filter({
        page: $scope.filterConfig.page + 1,
        pageSize: $scope.filterConfig.entries,
        search: $scope.filterConfig.search,
        ordering: ($scope.filterConfig.sortorder === "ASC" ? "" : "-") + $scope.filterConfig.sortfield
      })
      .$promise
      .then(function (res) {
        res.results.forEach($scope.amendHosts);
        $scope.data = res;
      })
      .catch(function (error) {
        console.log("An error occurred", error);
      });
  };

  $scope.amendHosts = function (host) {
    host.iscsiIqn = [];
    host.fcWwn = [];
    var shares = $scope.shares.filter(function (share) {
      return host.id === share.host.id;
    });
    shares.forEach(function (share) {
      if (share.type === "iscsi") {
        host.iscsiIqn.push({
          "text": share.wwn,
          "id": share.id
        });
      } else {
        host.fcWwn.push({
          "text": share.wwn,
          "id": share.id
        });
      }
    });
    host.netdevice_set.forEach(function (device, index) {
      host.netdevice_set[index] = $scope.devices.filter(function (netDev) {
        return netDev.url === device.url;
      })[0];
      if (host.primary_ip_address &&
        host.primary_ip_address.device.url === host.netdevice_set[index].url) {
        host.netdevice_set[index].primary = host.primary_ip_address;
      }
    });
  };

  $scope.updateData = function () {
    $scope.loadInitiators().then(function () {
      $scope.loadNetdevices().then(function () {
        $scope.loadHosts();
      });
    });
  };

  $scope.tabData = {
    active: 0,
    tabs: {
      status: {
        show: "selection.item",
        state: "hosts.detail.status",
        class: "tc_statusTab",
        name: "Status"
      }
    }
  };
  $scope.tabConfig = {
    type: "host",
    linkedBy: "id",
    jumpTo: "more"
  };
  TabViewService.setScope($scope);
  $scope.changeTab = TabViewService.changeTab;

  $scope.$watch("filterConfig", function (newVal) {
    if (newVal.entries === null) {
      return;
    }
    $scope.updateData();
  }, true);

  $scope.$watch("selection.item", function (selitem) {
    $scope.hasSelection = Boolean(selitem);
    if (selitem) {
      $scope.changeTab("hosts.detail.status");
    } else {
      $state.go("hosts");
    }
  });

  $scope.addAction = function () {
    $state.go("hosts-add");
  };

  $scope.editAction = function () {
    $state.go("hosts-edit", {host: $scope.selection.item.id});
  };

  $scope.deleteAction = function () {
    if (!$scope.selection.item) {
      return;
    }
    var modalInstance = $uibModal.open({
      windowTemplateUrl: "templates/messagebox.html",
      templateUrl: "templates/hosts/delete-host.html",
      controller: "HostDeleteCtrl",
      resolve: {
        host: function () {
          return $scope.selection.item;
        }
      }
    });
    modalInstance.result.then(function () {
      $scope.filterConfig.refresh = new Date();
    });
  };
});
