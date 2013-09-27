/*
 Copyright (C) 2011-2012, it-novum GmbH <community@open-attic.org>

 openATTIC is free software; you can redistribute it and/or modify it
 under the terms of the GNU General Public License as published by
 the Free Software Foundation; version 2.

 This package is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
*/

Ext.namespace("Ext.oa");

Ext.oa.Lio__HostAttrPlugin = {
  getStore: function(tree){
    Ext.define('lio_initiators_model', {
      extend: 'Ext.data.Model',
      fields: [
        'id', '__unicode__', 'text',
        {name: "hostname", mapping: "host", convert: toUnicode}
      ]
    });
    var store = Ext.create('Ext.data.TreeStore', {
      model: "lio_initiators_model",
      root: {
        text: gettext("Initiators"),
        id: "initiators_root",
        leaf: false,
        expanded: false,
      },
      proxy: {
        type:       'direct',
        directFn:   lio__Initiator.all,
        pageParam:  undefined,
        startParam: undefined,
        limitParam: undefined
      },
      listeners: {
        load: function(self, node, records, success, ovOpts){
          for( var i = 0; i < records.length; i++ ){
            records[i].set("id",   "lio__Initiator." + records[i].get("id"));
            records[i].set("leaf", true);
            records[i].set("text", records[i].get("__unicode__"));
            records[i].commit();
          }
        }
      }
    });
    return store;
  },
  addClicked: function(tree, selectedRecord, currentHost){
    if( selectedRecord.data.id !== "initiators_root" && selectedRecord.data.parentId !== "initiators_root" )
      return;
    var addwin = Ext.oa.getShareEditWindow({
      title: gettext("Add Initiator"),
      api: lio__Initiator,
      form: {
        items: [{
          xtype: "hidden",
          name:  "host",
          value: currentHost.id
        }, {
          fieldLabel: gettext('Type'),
          name:      'type',
          xtype:      'combo',
          store: [ [ 'iscsi',  gettext('iSCSI')  ], [ 'qla2xxx', gettext('Fibre Channel') ] ],
          typeAhead:     true,
          triggerAction: 'all',
          deferEmptyText: false,
          emptyText:     'Select...',
          selectOnFocus: true,
          value: "iscsi"
        }, {
          xtype: 'textfield',
          fieldLabel: gettext('WWN/IQN'),
          name: "wwn"
        }]
      },
      success: function(){
        Ext.getCmp("ifconfig__host_attributes_panel_inst").refresh();
      }
    });
    addwin.show();
  },
  removeClicked: function(tree, selectedRecord){
    if( selectedRecord.data.parentId !== "initiators_root" )
      return;
    var recid = parseInt(selectedRecord.data.id.split(".")[1]);
    Ext.Msg.confirm(
      gettext('Confirm delete'),
      interpolate(gettext('Really delete Initiator %s?'), [selectedRecord.data.text]),
      function(btn, text){
        if( btn === 'yes' ){
          lio__Initiator.remove(recid, function(provider, response){
            if( response.type !== 'exception' ){
              self.remove(true);
            }
          });
        }
      }
    );
  }
};

window.HostAttrPlugins.push( Ext.oa.Lio__HostAttrPlugin );

// kate: space-indent on; indent-width 2; replace-tabs on;
