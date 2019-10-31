# -*- coding: utf-8 -*-
# Copyright (c) 2019, PT. Cipta Dinamika Unggul and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.document import Document
from datetime import datetime

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
		_now = datetime.now()
		_job_started = 1
		if (int(job_card[0]) > 0):
			_job_started = 0
			
			# data.modified = _now
			data.started_time = data.started_time
			data.__unsaved = 1
			data.job_started = 0
			data.time_logs[(_count-1)].parent = dt.parent
			data.time_logs[(_count-1)].idx = dt.idx
			data.time_logs[(_count-1)].name = dt.name
			data.time_logs[(_count-1)].from_time = dt.from_time
			data.time_logs[(_count-1)].to_time = _now
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
		frappe.db.commit()
		# return data
		
		filters = {
			"name": ["=",job_id],
		}
		job_card = frappe.db.get_value('Job Card', filters, ['job_started','for_quantity','input','output'])
		return {
			'status' : job_card[0],
			'employee_name' : data_employee['employee_name'],
			'target' : int(job_card[1]),
			'mesin_id' : mesin_id,
			'job_id' : job_id,
			'input' : job_card[2],
			'output' : job_card[3]
		}
	else:
		return {'status':'Job Card not available'}


@frappe.whitelist()
def set_actual(mesin_id,actual):

	filters = {"workstation": ["=",mesin_id]}	
	job_id,job_started,for_quantity = frappe.db.get_value('Job Card', filters, ['name','job_started','for_quantity'])	
	filters = {
		"parent": ["=",job_id]
		}
	# return job_id
	if job_started == 0:
		return {'status':'job card hasn\'t started yet'}

	job_card_time = frappe.db.get_value('Job Card Time Log', filters, '*', as_dict=True, order_by='idx desc')
	# job_card_time = frappe.db.get_value('Job Card Time Log', filters, '*')
	# return job_card_time
	if job_card_time:
		filters = {
		"parent": ["=",job_id],
		"time_log" :["=",job_card_time['idx']]
		}
		cm = frappe.db.get_value('Counting Machine', filters, '*', as_dict=True, order_by='time desc')
		_now = datetime.now()
		if(cm):			
			last_time = cm['time']
		else:
			last_time = job_card_time['from_time']

		filters = {
			"parent": ["=",job_id]
		}
		total_idx = frappe.db.count('Counting Machine', filters)
		idx = 1
		if(total_idx):
			idx = total_idx +1
		time_in_seconds = _now - last_time
		# frappe.throw(_("{0} - {1} = {2}").format(_now,job_card_time['from_time'],time_in_seconds.seconds))
		# return time_in_seconds.seconds
		not_good = job_card_time['not_good']
		completed_qty = float(actual) - float(not_good)
		frappe.db.set_value("Job Card Time Log", job_card_time['name'], "actual", actual)
		frappe.db.set_value("Job Card Time Log", job_card_time['name'], "completed_qty", completed_qty)
		
		# time cycle
		doc = frappe.get_doc({
			"doctype": "Counting Machine",
			"idx": idx,
			"parent": job_id,
            "parenttype": "Job Card",
            "parentfield": "time_cycle",
			"job_card": job_id,
			"time_log": job_card_time['idx'],
			"time": _now,
			"time_in_seconds":time_in_seconds.seconds
		})
		doc.save(
			ignore_permissions=True, # ignore write permissions during insert
			ignore_version=True # do not create a version record
		)
		frappe.db.commit()
		# end time cycle
		
		return {
			'status' : job_started,
			'employee_name' : '',
			'target' : int(for_quantity),
			'mesin_id' : mesin_id,
			'job_id' : job_id
		}
	else:
		return {'status' : 'time log not available'}


def get_employee(rf_id):
	filters = {
		"rf_id" : ["=",rf_id]
	}
	data = frappe.db.get_value('Employee',filters,['employee','employee_name'])
	if data:
		return {'employee_id':data[0], 'employee_name':data[1]}
	else:
		return {'employee_id':'0', 'employee_name':'0'}

@frappe.whitelist()
def get_time_cycle(job_id, time_log_id, limit_start, limit_page_length):
	
	_doctype = "Counting Machine"
	filters = {
			"parent": ["=",job_id],
			"time_log": ["=",time_log_id]
		}	

	doc = frappe.get_list(_doctype, 
		filters = filters, 
		fields = ['*'],
		order_by='time asc',
		limit_start=limit_start,
		limit_page_length=limit_page_length,
		as_list=False
		)
	total_data = frappe.db.count(_doctype, filters = filters)
	return {"doc":doc, "total_data":total_data}
	
	
@frappe.whitelist()
def set_total_time(job_id,mesin_id, total_time_hold, total_time_setup, total_time_stop):
	
	data = frappe.get_doc('Job Card', job_id)

	data.total_setup_time_in_mins = total_time_setup
	data.total_hold_time_in_mins = total_time_hold
	data.total_stop_time_in_mins = total_time_stop

	data.save(
		ignore_permissions=True, # ignore write permissions during insert
		ignore_version=True # do not create a version record
	)
	frappe.db.commit()

	return {'status' : 1}

@frappe.whitelist()
def insert_not_good(job_card,workstation,operation,quantity,company,employee):
	doc = frappe.get_doc({
        "doctype": "Not Good",
        "job_card": job_card,
		"workstation": workstation,
		"operation": operation,
		"quantity": quantity,
		"company": company,
		"employee": employee,
		"posting_date":frappe.utils.nowdate()
	}).insert()
	return {'status' : 1}
