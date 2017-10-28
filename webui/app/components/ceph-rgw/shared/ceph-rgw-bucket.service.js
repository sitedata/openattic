/**
 *
 * @source: http://bitbucket.org/openattic/openattic
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (c) 2017 SUSE LLC
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

import globalConfig from "globalConfig";
import _ from "lodash";

export default class CephRgwBucketService {
  constructor ($resource, $injector, $q, $filter) {
    let res = $resource(globalConfig.API.URL + "rgw/bucket", {}, {
      create: {
        url: globalConfig.API.URL + "ceph_radosgw/bucket/create",
        method: "PUT"
      },
      get: {
        url: globalConfig.API.URL + "ceph_radosgw/bucket/get",
        method: "GET"
      },
      put: {
        method: "PUT"
      },
      delete: {
        url: globalConfig.API.URL + "ceph_radosgw/bucket/delete",
        method: "DELETE"
      },
      query: {
        method: "GET",
        isArray: true,
        transformResponse: (data, headersGetter, status) => {
          // Make sure we have received valid data.
          if (!_.isString(data)) {
            return [];
          }
          data = JSON.parse(data);
          if (status !== 200) {
            return data;
          }
          // Return an array to be able to support wildcard searching someday.
          return [data];
        }
      },
      filter: {
        url: globalConfig.API.URL + "rgw/bucket",
        method: "GET",
        isArray: true,
        interceptor: {
          response: (response) => {
            // Get the filter parameters.
            let filterParams = _.cloneDeep(response.config.params);
            let matches = filterParams.ordering.match(/(-?)(.+)/);
            filterParams.sortorder = (matches[1] === "") ? "ASC" : "DESC";
            filterParams.sortfield = matches[2];
            // Get more bucket information.
            let requests = [];
            let me = $injector.get("cephRgwBucketService");
            _.forEach(response.data, (bucket) => {
              let deferred = $q.defer();
              me.get({"bucket": bucket}, undefined, deferred.resolve, deferred.reject);
              requests.push(deferred.promise);
            });
            return $q.all(requests).then((buckets) => {
              // Apply the filter.
              if (filterParams.search) {
                let expression = {};
                expression[filterParams.sortfield] = filterParams.search;
                buckets = $filter("filter")(buckets, expression);
              }
              buckets = $filter("orderBy")(buckets, filterParams.sortfield,
                filterParams.sortorder === "DESC");
              buckets = $filter("limitTo")(buckets, filterParams.pageSize,
                (filterParams.page - 1) * filterParams.pageSize);
              // Prepare the response object.
              return {
                $resolved: true,
                count: buckets.length,
                next: undefined,
                previous: undefined,
                results: buckets
              };
            });
          }
        }
      }
    });

    Object.assign(this, res);
  }
}
