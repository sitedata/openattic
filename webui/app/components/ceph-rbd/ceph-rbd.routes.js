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

export default ($stateProvider) => {
  $stateProvider
    .state("cephRbds", {
      url: "/ceph/rbds",
      views: {
        "main": {
          component: "cephRbdList"
        }
      },
      ncyBreadcrumb: {
        label: "Ceph RBDs"
      }
    })
    .state("cephRbds.detail", {
      views: {
        "tab": {
          component: "oaTabSet"
        }
      },
      ncyBreadcrumb: {
        skip: true
      }
    })
    .state("cephRbds-add", {
      url: "/rbds/add",
      views: {
        "main": {
          component: "cephRbdForm"
        }
      },
      params: {
        fsid: null,
        fromState: "cephRbds"
      },
      ncyBreadcrumb: {
        parent: "cephRbds",
        label: "Add"
      }
    })
    .state("cephRbds-edit", {
      url: "/rbds/edit/:fsid/:pool/:name",
      views: {
        "main": {
          component : "cephRbdForm"
        }
      },
      params: {
        fsid: null,
        fromState: "cephRbds"
      },
      ncyBreadcrumb: {
        label: "Edit {{rbd.name}}",
        parent: "cephRbds"
      }
    })
    .state("cephRbds-clone", {
      url: "/rbds/clone/:fsid/:pool/:name/:snap",
      views: {
        "main": {
          component : "cephRbdForm"
        }
      },
      params: {
        fsid: null,
        fromState: "cephRbds"
      },
      ncyBreadcrumb: {
        label: "Clone {{rbd.name}}",
        parent: "cephRbds"
      }
    })
    .state("cephRbds-copy", {
      url: "/rbds/copy/:fsid/:pool/:name",
      views: {
        "main": {
          component : "cephRbdForm"
        }
      },
      params: {
        fsid: null,
        fromState: "cephRbds"
      },
      ncyBreadcrumb: {
        label: "Copy {{rbd.name}}",
        parent: "cephRbds"
      }
    })
    .state("cephRbds.detail.statistics", {
      url          : "/statistics",
      views        : {
        "tab-content": {
          component: "cephRbdStatistics"
        }
      },
      ncyBreadcrumb: {
        label: "{{selection.item.name}} statistics"
      }
    })
    .state("cephRbds.detail.details", {
      url: "/details",
      views: {
        "tab-content": {
          component: "cephRbdDetail"
        }
      },
      ncyBreadcrumb: {
        label: "{{$ctrl.selection.item.name}} details"
      }
    })
    .state("cephRbds.detail.snapshot", {
      url: "/snapshot",
      views: {
        "tab-content": {
          component: "cephRbdSnapshot"
        }
      },
      ncyBreadcrumb: {
        label: "{{$ctrl.selection.item.name}} snapshots"
      }
    });
};
