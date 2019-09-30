# -*- coding: utf-8 -*-
# Copyright (c) 2019, PT. Cipta Dinamika Unggul and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CountingMachine(Document):
	pass

@frappe.whitelist()
def get_cm(rf_id='',mesin_id=''):

	data_employee = get_employee(rf_id)
	employee_id = data_employee['employee_id']
	filters = {
		"workstation": ["=",mesin_id],
		"employee": ["=",employee_id]
		}
	
	job_card = frappe.db.get_value('Job Card', filters, ['job_started','for_quantity','name'])

	if(job_card):
		job_started = 1
		if (int(job_card[0]) > 0):
			job_started = 0

		job_id = job_card[2]
		frappe.db.set_value("Job Card", job_id, "job_started", job_started)
	
		return {
			'status' : job_card[0],
			'employee_name' : data_employee['employee_name'],
			'target' : (job_card[1]),
			'mesin_id' : mesin_id,
			'job_id' : job_id
		}
	else:
		return {'status':'Job Card not available'}

@frappe.whitelist()
def set_actual(job_id,actual):
	filters = {
		"parent": ["=",job_id],
		"job_started": ["=",1]
		}
	job_card_time = frappe.db.get_value('Job Card Time Log', filters, '*')
	frappe.db.set_value("Job Card Time Log", job_card_time['name'], "actual", actual)
		
	return {'status' : 1}


def get_employee(rf_id):
	filters = {
		"rf_id" : ["=",rf_id]
	}
	data = frappe.db.get_value('Employee',filters,['employee','employee_name'])
	if(data):
		return {'employee_id':data[0], 'employee_name':data[1]}
	else:
		return {'employee_id':'0', 'employee_name':'0'}