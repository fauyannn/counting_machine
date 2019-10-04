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
		# return data
		_count = 0	
		for dt in data.time_logs:
			_count = dt.idx
		# return dt
		_now = frappe.utils.now()
		_job_started = 1
		if (int(job_card[0]) > 0):
			_job_started = 0
			newtime = {
				"from_time": dt.from_time,
				"docstatus": dt.docstatus,
				"doctype": dt.doctype,
				"name": dt.name,
				"owner": dt.owner,
				"completed_qty": dt.completed_qty,
				"parent": job_id,
				"parentfield": dt.parentfield,
				"parenttype": dt.parenttype,
				"idx": _count,
				"actual": dt.actual,
				"time_in_mins": dt.time_in_mins,
				"modified_by": dt.modified_by,
				"modified": _now,
				"creation": dt.creation,
				"not_good": dt.not_good,
				"to_time": _now
			}
			# data.modified = _now
			data.__unsaved = 1
			data.job_started = 0
			data.time_logs[(_count-1)].parent = dt.parent
			data.time_logs[(_count-1)].idx = dt.idx
			data.time_logs[(_count-1)].name = dt.name
			data.time_logs[(_count-1)].from_time = dt.from_time
			data.time_logs[(_count-1)].to_time = frappe.utils.now()
			data.time_logs[(_count-1)].actual = dt.actual
			data.time_logs[(_count-1)].__unsaved = 1
			# data.time_logs[(_count-1)].time_in_mins = dt.time_in_mins

			# return data
		else:
			
			new_idx = _count+1
			newtime = {
				"from_time": _now,
				"docstatus": 0,
				"doctype": "Job Card Time Log",
				"name": "New Job Card Time Log {}".format(new_idx),
				"__islocal": 1,
				"__unsaved": 1,
				"owner": "Administrator",
				"completed_qty": 0,
				"parent": job_id,
				"parentfield": "time_logs",
				"parenttype": "Job Card",
				"idx": new_idx 
				}
			
			data.started_time = _now
			# data.modified = _now
			data.__unsaved = 1
			data.job_started = 1
			# data.total_completed_qty = 10
			data.append("time_logs", newtime)
			
		data.save(
			ignore_permissions=True, # ignore write permissions during insert
			ignore_version=True # do not create a version record
		)

		# return data

		# job_card = frappe.db.set_value("Job Card", job_id, "job_started", job_started)
		# return job_card
		filters = {
			"name": ["=",job_id],
		}
		job_card = frappe.db.get_value('Job Card', filters, ['job_started','for_quantity'])
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

	job_card_time = frappe.db.get_value('Job Card Time Log', filters, '*', as_dict=True, order_by='idx desc')
	# return job_card_time
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