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
	# return (data_employee)
	if data_employee['employee_id'] == "0":
		return {'status':'Employee not found'}

	employee_id = data_employee['employee_id']
	filters = {
		"workstation": ["=",mesin_id],
		"employee": ["=",employee_id],
		"docstatus":0
		}
	
	job_card = frappe.db.get_value('Job Card', filters, ['job_started','for_quantity','name'])

	if job_card:
		job_id = job_card[2]
		data = frappe.get_doc('Job Card', job_id)
		
		job_started = 1
		if (int(job_card[0]) > 0):
			job_started = 0

		else:		

			_count = 0	
			for dt in data.time_logs:
				_count = dt.idx
			new_idx = _count+1
			newtime = {
				"docstatus": 0,
				"doctype": "Job Card Time Log",
				"name": "New Job Card Time Log 1",
				"__islocal": 1,
				"__unsaved": 1,
				"owner": "Administrator",
				"completed_qty": 0,
				"parent": job_id,
				"parentfield": "time_logs",
				"parenttype": "Job Card",
				"idx": new_idx,
				"from_time": frappe.utils.now() 
				}
			
			data.started_time = frappe.utils.now()
			data.__unsaved = 1
			data.job_started = 1
			data.total_completed_qty = 10
			data.append("time_logs", newtime)
			# return data
			data.save(
				ignore_permissions=True, # ignore write permissions during insert
    			ignore_version=True # do not create a version record
			)

			return data

		# job_card = frappe.db.set_value("Job Card", job_id, "job_started", job_started)
		# return job_card
		job_card = frappe.db.get_value('Job Card', filters, ['job_started','for_quantity','name'])
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
	if job_started == 0:
		return {'status':'job card hasn\'t started yet'}

	job_card_time = frappe.db.get_value('Job Card Time Log', filters, '*')
	return job_card_time
	if job_card_time:
		frappe.db.set_value("Job Card Time Log", job_card_time['name'], "actual", actual)
		return {'status' : 1}
	else:
		return {'status' : 0}


@frappe.whitelist()
def get_docu(job_id=211,xx=None):
	return job_id


def get_employee(rf_id):
	filters = {
		"rf_id" : ["=",rf_id]
	}
	data = frappe.db.get_value('Employee',filters,['employee','employee_name'])
	if data:
		return {'employee_id':data[0], 'employee_name':data[1]}
	else:
		return {'employee_id':'0', 'employee_name':'0'}