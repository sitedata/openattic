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
app.factory("poolCheckingService", function (PoolService) {
  var saved = {
    source: "",
    pool: "",
    special: false
  };

  function get(selection) {
    if (!selection.item || !selection.item.source_pool) {
      return;
    }
    var source = selection.item.source_pool;
    if (angular.equals(saved.source, source)) {
      return saved;
    }
    new PoolService.get(source).$promise.then(function (res) {
      saved.source = source;
      saved.pool = res.type;
      if (!saved.pool) {
        return;
      }
      var pool = saved.pool.app_label;
      saved.special = pool === "zfs" || pool === "btrfs";
    });
    return saved;
  }
  return {get: get};
});