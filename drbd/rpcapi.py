# -*- coding: utf-8 -*-
# kate: space-indent on; indent-width 4; replace-tabs on;

"""
 *  Copyright (C) 2011-2012, it-novum GmbH <community@open-attic.org>
 *
 *  openATTIC is free software; you can redistribute it and/or modify it
 *  under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; version 2.
 *
 *  This package is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
"""

from rpcd.handlers import ModelHandler

from drbd.models import Connection, Endpoint
from ifconfig.models import Host

from volumes.rpcapi import AbstractBlockVolumeHandler

class DrbdConnectionHandler(AbstractBlockVolumeHandler):
	model = Connection

	def _override_get(self, obj, data):
		handler = self._get_handler_instance(Endpoint)
		data["endpoint_set"] = [
			handler._idobj(endpoint) for endpoint in obj.endpoint_set.all()
		]

		return data

class DrbdEndpointHandler(ModelHandler):
	model = Endpoint

	def _getobj(self, obj):
		data = ModelHandler._getobj(self, obj)
		data["type"] = obj.type
		data["megs"] = obj.megs
		data["status"] = obj.status
		data["path"] = obj.path
		data["host"] = self._get_handler_instance(Host)._idobj(obj.host)
		return data

RPCD_HANDLERS = [DrbdConnectionHandler, DrbdEndpointHandler]