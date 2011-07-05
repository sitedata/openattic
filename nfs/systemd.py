# -*- coding: utf-8 -*-
# kate: space-indent on; indent-width 4; replace-tabs on;

import os, sys
import dbus.service

from threading import Lock

from django.conf import settings

from lvm.procutils import invoke
from lvm.systemd   import logged
from nfs.models    import Export
from nfs.conf      import settings as nfs_settings

@logged
class SystemD(dbus.service.Object):
    dbus_path = "/nfs"

    def __init__(self, bus, busname):
        self.bus     = bus
        self.busname = busname
        self.lock    = Lock()
        dbus.service.Object.__init__(self, self.bus, self.dbus_path)

    @dbus.service.method(settings.DBUS_IFACE_SYSTEMD, in_signature="", out_signature="i")
    def writeconf(self):
        self.lock.acquire()
        try:
            fd = open( nfs_settings.EXPORTS, "wb" )
            for export in Export.objects.filter(state__in=("new", "update", "active")).exclude(volume__state="update"):
                fd.write( "%-50s %s(%s)\n" % ( export.path, export.address, export.options ) )
            fd.close()

            return invoke(["/usr/sbin/exportfs", "-a"])
        finally:
            self.lock.release()

