{% load i18n %}

{% comment %}
 Copyright (C) 2011-2012, it-novum GmbH <community@open-attic.org>

 openATTIC is free software; you can redistribute it and/or modify it
 under the terms of the GNU General Public License as published by
 the Free Software Foundation; version 2.

 This package is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
{% endcomment %}

Ext.namespace("Ext.oa");

Ext.oa.ShareGridPanel = Ext.extend(Ext.grid.GridPanel, {
  api: null,
  form: {},
  texts: {},

  initComponent: function(){
    var self = this;
    Ext.applyIf(this.texts, {
      reload:  "{% trans 'Reload' %}",
      add:     "{% trans 'Add Export' %}",
      edit:    "{% trans 'Edit Export' %}",
      remove:  "{% trans 'Delete Export' %}",
      submit:  "{% trans 'Submit' %}",
      cancel:  "{% trans 'Cancel' %}",
      confirm: "{% trans 'Do you really want to delete export %s?' %}"
    });
    if( typeof this.buttons === "undefined" ){
      this.buttons = [];
    }
    else{
      for( var i = 0; i < this.buttons.length; i++ ){
        if( typeof this.buttons[i].scope === "undefined" )
          this.buttons[i].scope = this;
      }
    }
    Ext.apply(this, Ext.applyIf(this.initialConfig, {
      keys: [{
        scope: self,
        key: [Ext.EventObject.DELETE],
        handler: this.deleteFunction
        }],
      store: new Ext.data.DirectStore({
        fields: (function(){
          var cols = ["id"];
          for( var i = 0; i < self.columns.length; i++ ){
            cols.push(self.columns[i].dataIndex);
          }
          if( typeof self.storefields !== "undefined" ){
            for( var i = 0; i < self.storefields.length; i++ ){
              cols.push(self.storefields[i]);
            }
          }
          return cols;
        }()),
        directFn: self.api.all
      }),
      viewConfig: {
        forceFit: true
      }
    }));
    this.buttons.push.apply( this.buttons, [ {
      text: "",
      icon: MEDIA_URL + "/icons2/16x16/actions/reload.png",
      tooltip: self.texts.reload,
      scope: self,
      handler: function(){
        self.store.reload();
      }
    }, {
      text: self.texts.add,
      icon: MEDIA_URL + "/icons2/16x16/actions/add.png",
      scope: self,
      handler: function(){
        self.showEditWindow({
          title: self.texts.add,
          submitButtonText: self.texts.add
        });
      }
    }, {
      text:  self.texts.edit,
      icon: MEDIA_URL + "/icons2/16x16/actions/edit-redo.png",
      scope: self,
      handler: function(){
        var sm = self.getSelectionModel();
        if( sm.hasSelection() ){
          var sel = sm.selections.items[0];
          self.showEditWindow({
            title: self.texts.edit,
            submitButtonText: self.texts.edit
          }, sel.data);
        }
      }
    }, {
      text: self.texts.remove,
      icon: MEDIA_URL + "/icons2/16x16/actions/remove.png",
      handler: this.deleteFunction,
      scope: self
    } ] );
    Ext.oa.ShareGridPanel.superclass.initComponent.apply(this, arguments);
  },

  editFunction: function(self){
    var sm = this.getSelectionModel();
    if( sm.hasSelection() ){
      var sel = sm.selections.items[0];
      this.showEditWindow({
        title: self.texts.edit,
        submitButtonText: self.texts.edit
      },sel.data);
    }
  },

  deleteConfirm: function(sel){
    return interpolate(this.texts.confirm, [sel.data.path]);
  },

  deleteFunction: function(){
    var sm = this.getSelectionModel();
    var self = this;
    if( sm.hasSelection() ){
      var sel = sm.selections.items[0];
      Ext.Msg.confirm(
        self.texts.remove,
        self.deleteConfirm(sel),
        function(btn){
          if(btn == 'yes'){
            self.api.remove( sel.data.id, function(provider, response){
              sel.store.reload();
            } );
          }
        }
      );
    }
  },

  showEditWindow: function(config, record){
    var self = this;
    var addwin = new Ext.Window(Ext.apply(config, {
      layout: "fit",
      defaults: {
        autoScroll: true
      },
      height: 240,
      width: 500,
      items: (function(){
        var form = {
          xtype: "form",
          bodyStyle: 'padding: 5px 5px;',
          api: {
            load:   self.api.get_ext,
            submit: self.api.set_ext
          },
          baseParams: {
            id: (record ? record.id: -1)
          },
          paramOrder: ["id"],
          listeners: {
            afterrender: function(form){
              form.getForm().load();
            }
          },
          defaults: {
            xtype: "textfield",
            anchor: '-20px',
            defaults : {
              anchor: "0px"
            }
          },
          buttons: [{
            text: config.submitButtonText,
            icon: MEDIA_URL + "/oxygen/16x16/actions/dialog-ok-apply.png",
            handler: function(btn){
              btn.ownerCt.ownerCt.getForm().submit({
                success: function(provider, response){
                  if(response.result){
                    self.store.reload();
                    addwin.hide();
                  }
                }
              });
            }
          },{
            text: self.texts.cancel,
            icon: MEDIA_URL + "/icons2/16x16/actions/gtk-cancel.png",
            handler: function(){
              addwin.hide();
            }
          }]
        };
        Ext.apply(form, self.form);
        for( var i = 0; i < form.items.length; i++ ){
          if( form.items[i].disabled )
            form.items[i].disabled = !record;
        }
        return form;
      }())
    }));
    addwin.show();
  },

  onRender: function(){
    Ext.oa.ShareGridPanel.superclass.onRender.apply(this, arguments);
    this.store.reload();
    var self = this;
    var menubuttons = [];
    for( var i = 0; i < self.buttons.length; i++ ){
      menubuttons.push({
        text:    (self.buttons[i].initialConfig.text || self.buttons[i].initialConfig.tooltip),
        icon:     self.buttons[i].initialConfig.icon,
        handler:  self.buttons[i].initialConfig.handler,
        scope:    self.buttons[i].initialConfig.scope
      });
    }
    var menu = new Ext.menu.Menu({
      items: menubuttons
    });
    this.on({
      rowcontextmenu: function(grid, row, event){
        this.selectedNode = this.store.getAt(row);
        if((row) !== false) {
          this.getSelectionModel().selectRow(row);
        }
        event.stopEvent();
        menu.showAt(event.xy);
      },
      rowdblclick: function(grid, row, event){
        if( this.getSelectionModel().hasSelection() ){
          this.editFunction(this);
        }
      },
    }, this);
  }
});

Ext.reg("sharegridpanel", Ext.oa.ShareGridPanel);

// kate: space-indent on; indent-width 2; replace-tabs on;

