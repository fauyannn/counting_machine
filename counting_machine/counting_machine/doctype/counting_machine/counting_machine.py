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
	
	if(data_employee['employee_id'] == "0"):
		return {'status':'Employee not found'}

	employee_id = data_employee['employee_id']
	filters = {
		"workstation": ["=",mesin_id],
		"employee": ["=",employee_id],
		"docstatus":0
		}
	
	job_card = frappe.db.get_value('Job Card', filters, ['job_started','for_quantity','name'])

	if(job_card):
		job_started = 1
		if (int(job_card[0]) > 0):
			job_started = 0

		job_id = job_card[2]
		frappe.db.set_value("Job Card", job_id, "job_started", job_started)
		# return 12233
		return {
			'status' : job_card[0],
			'employee_name' : data_employee['employee_name'],
			'target' : int(job_card[1]),
			'mesin_id' : mesin_id,
			'job_id' : job_id
		}
	else:
		return {'status':'Job Card not available'}


@frappe.whitelist()
def set_actual(mesin_id,actual):

	filters = {"workstation": ["=",mesin_id]}	
	job_id,job_started = frappe.db.get_value('Job Card', filters, ['name','job_started'])	
	filters = {
		"parent": ["=",job_id]
		}
	# return job_id
	if(job_started == 0):
		return {'status':'job card hasn\'t started yet'}

	job_card_time = frappe.db.get_value('Job Card Time Log', filters, '*')
	return job_card_time
	if(job_card_time):
		frappe.db.set_value("Job Card Time Log", job_card_time['name'], "actual", actual)
		return {'status' : 1}
	else:
		return {'status' : 0}


def get_employee(rf_id):
	filters = {
		"rf_id" : ["=",rf_id]
	}
	data = frappe.db.get_value('Employee',filters,['employee','employee_name'])
	if(data):
		return {'employee_id':data[0], 'employee_name':data[1]}
	else:
		return {'employee_id':'0', 'employee_name':'0'}