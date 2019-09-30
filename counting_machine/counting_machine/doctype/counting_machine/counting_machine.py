# -*- coding: utf-8 -*-
# Copyright (c) 2019, PT. Cipta Dinamika Unggul and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CountingMachine(Document):
	pass

@frappe.whitelist()
def get_cm(rf_id='',id_mesin=''):

	employee_id = get_employee(rf_id)
	
	filters = {
		"workstation": ["=",id_mesin],
		"employee": ["=",employee_id],
		"job_started": ["=",1]
		}
	operation = frappe.db.get_value('Job Card', filters, ['operation','employee'])
	return operation


def get_employee(rf_id):
	filters = {
		"rf_id" : ["=",rf_id]
	}
	data = frappe.db.get_value('Employee',filters,['employee'])
	return data