# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Production"),
			"items": [
				{
					"type": "doctype",
					"name": "Dice and Jig"
				}
			]
		},
		# {
		# 	"label": _("Settings"),
		# 	"items": [
		# 		{
		# 			"type": "doctype",
		# 			"name": "Machine"
		# 		}
		# 	]
		# }
	]
