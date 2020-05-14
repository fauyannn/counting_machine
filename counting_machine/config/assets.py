# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Dies and Jig"),
			"items": [
				{
					"type": "doctype",
					"name": "Dies and Jig"
				}
            ]
        }
	]
