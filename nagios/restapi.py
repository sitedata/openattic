# -*- coding: utf-8 -*-
# kate: space-indent on; indent-width 4; replace-tabs on;

"""
 *  Copyright (C) 2011-2014, it-novum GmbH <community@open-attic.org>
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

from rest_framework import serializers, viewsets
from rest_framework.reverse import reverse
from rest_framework.response import Response
from rest_framework.decorators import detail_route

from nagios.models import Service, Graph
from rest import relations


class ServiceSerializer(serializers.HyperlinkedModelSerializer):
    graphs  = serializers.SerializerMethodField('get_graphs')
    last_check  = serializers.DateTimeField(read_only=True)
    next_check  = serializers.DateTimeField(read_only=True)
    status      = serializers.CharField(read_only=True)
    plugin_output = serializers.CharField(source="state.plugin_output", read_only=True)
    perfdata      = serializers.SerializerMethodField('get_performance_data')
    host          = relations.HyperlinkedRelatedField(view_name='host-detail', many=False, read_only=False)

    class Meta:
        model  = Service
        fields = ('url', 'id', 'host', 'description', 'graphs', 'last_check', 'next_check', 'status', 'plugin_output', 'perfdata')

    def get_graphs(self, obj):
        graphs = []
        for graph in Graph.objects.filter( command=obj.command ):
            graphs.append({
                "id":    graph.id,
                "title": graph.title,
                "url":   reverse("nagios.views.graph", args=(obj.id, graph.id), request=self.context["request"])
            })
        try:
            for (srcid, title) in obj.rrd.source_labels.items():
                graphs.append({
                    "id":    srcid,
                    "title": title,
                    "url":   reverse("nagios.views.graph", args=(obj.id, srcid), request=self.context["request"])
                })
        except SystemError:
            pass
        return graphs

    def get_performance_data(self, obj):
        try:
            return obj.perfdata
        except SystemError:
            return None


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    filter_fields = ('host__name', 'description')
    search_fields = ('host__name', 'description')

    @detail_route()
    def fetch(self, request, *args, **kwargs):
        obj = self.get_object()
        rrd = obj.rrd
        srcname = request.GET["srcname"]
        try:
            start  = int(request.GET.get("start",  rrd.last_check - 24*60*60))
            end    = int(request.GET.get("end",    rrd.last_check))

            # Accept negative numbers for start and end by interpreting them as
            # "x seconds before last_check". The numbers are negative already,
            # so we need to ADD them.
            if end <= 0:
                end = rrd.last_check + end
            if start <= 0:
                start = rrd.last_check + start

            if start <= 0:
                raise ValueError("start date must be greater than zero")
            if end <= 0:
                raise ValueError("end date must be greater than zero")

        except ValueError, err:
            print >> sys.stderr, unicode(err)
            raise Http404("Invalid start or end specified")

        return Response(rrd.fetch(srcname, start, end))



RESTAPI_VIEWSETS = [
    ('services', ServiceViewSet),
]
