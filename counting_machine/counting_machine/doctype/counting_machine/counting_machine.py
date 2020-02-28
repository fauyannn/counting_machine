# -*- coding: utf-8 -*-
# Copyright (c) 2019, PT. Cipta Dinamika Unggul and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.document import Document
from datetime import datetime
import array as arr
import json

class CountingMachine(Document):
	pass

@frappe.whitelist()
def get_cm(rf_id='',mesin_id=''):

	data_employee = get_employee(rf_id)
	# return (data_employee)
	if data_employee['employee_id'] == "0":
		return {'status':9,'message':'Employee not found', 'long_message':'Employee not found'}

	employee_id = data_employee['employee_id']
	filters = {
		"workstation": ["=",mesin_id],
		"employee": ["=",employee_id],
		"docstatus":0,
		"workflow_state":["!=",'Send to QC']
		}
	
	# ['job_started','for_quantity','name']
	job_card = frappe.db.get_value('Job Card', filters, ['job_started','for_quantity','name'], as_dict=False, order_by='creation asc')
	
	# return job_card
	actual = 0
	if job_card:
		job_id = job_card[2]
		_now = datetime.now()
		try:
			data = frappe.get_doc('Job Card', job_id)
			# return data
			_count = 0	
			for dt in data.time_logs:
				_count = dt.idx
				actual += dt.actual
			# return dt
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
				
			data.status = 'Send to QC'
			data.save(
				ignore_permissions=True, # ignore write permissions during insert
				ignore_version=True # do not create a version record
			)
			frappe.db.commit()
			# return data
			
			filters = {
				"name": ["=",job_id],
			}
			job_card = frappe.db.get_value('Job Card', filters, ['job_started','for_quantity','input','output','planned_production_time_in_mins','ideal_cycle_time_in_secs'])

			target = int(job_card[1]) - actual

			# if(target<0):
				# target = 0

			return {
				'status' : job_card[0],
				'employee_name' : data_employee['employee_name'],
				'target' : target,
				'mesin_id' : mesin_id,
				'job_id' : job_id,
				'input' : job_card[2],
				'output' : job_card[3],
				'actual' : 0, 
				'planned_production_time' : int(job_card[4]),
				'ideal_cycle_time' : int(job_card[5])
			}
		except Exception as e:			
			job_card_error_log(job_id, _now, str(e))
			return {'status':9,'message': job_id.strip('PO-')+' Error', 'long_message':str(e)}
			pass

	else:
		return {'status':9,'message':'Job not found', 'long_message':'Job Card not available'}

@frappe.whitelist()
def job_card_error_log(job_id, _now, message):
	doc = frappe.get_doc({
        "doctype": "Job Card Error Log",
        "job_card": 'PO-JOB00020',
		"datetime": _now,
		"message": message,
		"docstatus" : 1
	}).insert(ignore_permissions=True)
	return True
	
@frappe.whitelist()
def set_actual(mesin_id,actual):

	filters = {"workstation": ["=",mesin_id]}	
	job_id,job_started,for_quantity = frappe.db.get_value('Job Card', filters, ['name','job_started','for_quantity'])	
	filters = {
		"parent": ["=",job_id]
		}
	# return job_id
	if job_started == 0:
		return {'status':9,'message':'job not started yet','long_message':'job card hasn\'t started yet'}

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
		return {'status':9,'message':'time log not found','long_message':'time logs not found'}


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
def counting_report(job_id, total_time_hold, total_time_setup, total_time_stop, total_hold_qty, total_setup_qty, total_stop_qty,employee_performance,average_cycle_time_in_mins,average_time_setup_in_mins,average_time_hold_in_mins,average_time_stop_in_mins,availability,actual):
	
	data = frappe.get_doc('Job Card', job_id)
	filters = {
		"parent": ["=",job_id]
		}
	# return data
	# job_card_time = frappe.db.count('Job Card Time Log', filters)
	# return job_card_time

	name_last_time_logs = ''
	total_completed_qty = 0
	total_employee_performance = 0
	total_availability = 0
	total_average_cycle_time_in_mins = 0
	total_average_time_setup_in_mins = 0
	total_average_time_hold_in_mins = 0
	total_average_time_stop_in_mins = 0
	_count = 0
	for dt in data.time_logs:
		_count += 1
		name_last_time_logs = dt.name
		total_completed_qty += dt.actual
		total_employee_performance += float(dt.employee_performance)
		total_availability += float(dt.availability)
		
		total_average_cycle_time_in_mins += float(dt.average_cycle_time_in_mins)
		total_average_time_setup_in_mins += float(dt.average_time_setup_in_mins)
		total_average_time_hold_in_mins += float(dt.average_time_hold_in_mins)
		total_average_time_stop_in_mins += float(dt.average_time_stop_in_mins)
	# return {'a':total_average_cycle_time_in_mins,'b':total_completed_qty}
	data.total_completed_qty = total_completed_qty

	data.total_setup_time_in_mins = float(data.total_setup_time_in_mins) + (float(total_time_setup)/60)
	data.total_hold_time_in_mins = float(data.total_hold_time_in_mins) + (float(total_time_hold)/60)
	data.total_stop_time_in_mins = float(data.total_stop_time_in_mins) + (float(total_time_stop)/60)

	data.total_hold_qty = int(data.total_hold_qty) + int(total_hold_qty)
	data.total_setup_qty = int(data.total_setup_qty) + int(total_setup_qty)
	data.total_stop_qty = int(data.total_setup_qty) + int(total_stop_qty)

	data.employee_performance = (int(total_employee_performance) + int(employee_performance))/_count
	data.availability = (int(total_availability) + int(availability))/_count
	
	data.average_cycle_time_in_mins = (float(total_average_cycle_time_in_mins) + (float(average_cycle_time_in_mins)/60)) / _count
	data.average_time_setup_in_mins = (float(total_average_time_setup_in_mins) + (float(average_time_setup_in_mins)/60)) / _count
	data.average_time_hold_in_mins = (float(total_average_time_hold_in_mins) + (float(average_time_hold_in_mins)/60)) / _count
	data.average_time_stop_in_mins = (float(total_average_time_stop_in_mins) + (float(average_time_stop_in_mins)/60)) / _count

	data.save(
		ignore_permissions=True, # ignore write permissions during insert
		ignore_version=True # do not create a version record
	)

	frappe.db.commit()

	# Setting actual
	frappe.db.set_value("Job Card Time Log", name_last_time_logs, "employee_performance", int(employee_performance))
	frappe.db.set_value("Job Card Time Log", name_last_time_logs, "availability", int(availability))
	frappe.db.set_value("Job Card Time Log", name_last_time_logs, "average_cycle_time_in_mins", (float(average_cycle_time_in_mins)/60))
	frappe.db.set_value("Job Card Time Log", name_last_time_logs, "average_time_hold_in_mins", (float(average_time_hold_in_mins)/60))
	frappe.db.set_value("Job Card Time Log", name_last_time_logs, "average_time_stop_in_mins", (float(average_time_stop_in_mins)/60))
	frappe.db.set_value("Job Card Time Log", name_last_time_logs, "average_time_setup_in_mins", (float(average_time_setup_in_mins)/60))

	frappe.db.set_value("Job Card Time Log", name_last_time_logs, "actual", actual)
	return {'status' : 1,'_count':_count,'tact':total_average_cycle_time_in_mins,'act':(float(average_cycle_time_in_mins)/60)}
	# return {'status' : 1, 'pembagi':pembagi,'db_cycle':data.average_cycle_time_in_mins, 'cycle':(int(average_cycle_time_in_mins)/60),'hasil':((int(data.average_cycle_time_in_mins) + (int(average_cycle_time_in_mins)/60)) / pembagi)}
	# except Exception as e:		
	# 	return {'status' : 0,'message':'error'}

@frappe.whitelist()
def insert_not_good(job_card,workstation,operation,quantity,company,employee,work_order):
	data_wo = frappe.get_doc('Work Order', work_order)
	# return data_wo
	doc = frappe.get_doc({
        "doctype": "Not Good",
        "job_card": job_card,
		"workstation": workstation,
		"operation": operation,
		"quantity": quantity,
		"company": company,
		"employee": employee,
		"work_order":work_order,
		"item_code":data_wo.production_item,
		"item_name":data_wo.item_name,
		"posting_date":frappe.utils.nowdate()
	}).insert()
	return {'status' : 1}

@frappe.whitelist()
def sendToQC(job_id,status,docstatus,workflow_state):
	frappe.db.set_value("Job Card", job_id, "status", status)
	frappe.db.set_value("Job Card", job_id, "docstatus", docstatus)
	frappe.db.set_value("Job Card", job_id, "workflow_state", workflow_state)
	
	# frappe.db.commit()
	return {'status' : 1,'job_id':job_id,'_status':status,'docstatus':docstatus,'workflow_state':workflow_state}

@frappe.whitelist()
def sendToWIP(job_id,status):
	frappe.db.set_value("Job Card", job_id, "status", status)
	# frappe.db.commit()
	return {'status' : 1,'job_id':job_id,'_status':status}


@frappe.whitelist()
def updateQtyWO(wo_id,job_id,qty,status):
	frappe.db.set_value("Work Order", wo_id, "qty", qty)
	frappe.db.set_value("Work Order", wo_id, "status", status)
	# frappe.db.set_value("Job Card", job_id, "for_quantity", qty)
	# frappe.db.set_value("Job Card", '3da54fc70e', "status", 'Completed')
	frappe.db.commit()
	return {'status' : 1,'wo_id':wo_id,'qty':qty}

@frappe.whitelist()
def updateStatus(doctype,id,status):
	frappe.db.set_value(doctype, id, "status", status)
	return {'success':1,'status' : status,'id':id,'doctype':doctype}

@frappe.whitelist()
def updateDataGlobal(doctype,id,field,value):
	frappe.db.set_value(doctype, id, field, value)
	return {'success':1,'doctype':doctype,'id' : id,'field':field,'value':value}

@frappe.whitelist()
def cancelButton(doctype,id):
	frappe.db.set_value(doctype, id, "docstatus", 2)
	return {'success':1,'id':id,'doctype':doctype}

@frappe.whitelist()
def insert_batch_no(batch_id,item):	
	filters = {
		"item_code": ["=",item]
		}
	doc_item = frappe.get_doc('Item', item)
	# return doc_item
	if not doc_item.has_batch_no:
		return {'status' : 0,'batch_id':0,'item':item,'doc':doc_item}

	filters = {
		"batch_id": ["=",batch_id],
		"item": ["=",item]
		}
	doc = frappe.db.get_value('Batch', filters, ['batch_id','item'])
	if doc:
		return {'status' : 0,'batch_id':batch_id,'item':item,'doc':doc}
	else: 
		doc = frappe.get_doc({
			"doctype": "Batch",
			"batch_id": batch_id,
			"item": item
		}).insert()
		

	return {'status' : 1,'batch_id':batch_id,'item':item}

@frappe.whitelist()
def get_bom_with_item(items):
	items = items.split('-_-')
	filters = {
		"item": ["in",items]
		}
	childs = frappe.db.get_list("BOM",filters,['name','uom','quantity','item','item_name'])
	return {'param' : items, 'data':childs}

@frappe.whitelist()
def get_bom_tree(bom_no):
	bom_doc = frappe.get_doc("BOM", bom_no)

	bom_items = frappe.get_all('BOM Item',
			fields=['item_code', 'bom_no', 'stock_qty'],
			filters=[['parent', '=', bom_no]],
			order_by='idx')

	item_names = tuple(d.get('item_code') for d in bom_items)
	items = frappe.get_list('Item',
			fields=['image', 'description', 'name', 'stock_uom', 'item_name'],
			filters=[['name', 'in', item_names]]) # to get only required item dicts

	for bom_item in bom_items:
		# extend bom_item dict with respective item dict
		bom_item.update(
			# returns an item dict from items list which matches with item_code
			next(item for item in items if item.get('name')
				== bom_item.get('item_code'))
		)

		bom_item.parent_bom_qty = bom_doc.quantity
		bom_item.expandable = 0 if bom_item.bom_no in ('', None)  else 1

	return bom_items
	# return get_children('BOM',bom_no)

@frappe.whitelist()
def get_time_cycle2(bom_no,operation,workstation):
	filters = {
		"name" : ["=",bom_no]		
	}
	opw = operation+'_'+workstation
	data = frappe.get_doc('BOM',filters)
	time = 0
	time2 = 0
	if data.operations:
		for op in data.operations :
			# if op.operation and op.workstation :
			# 	k = op.operation+'_'+op.workstation
			# 	time = {k:op.time_in_mins*60}
			# 	if(op.time_in_mins > 0):
			time2 = op.time_in_mins*60
		# return time
		# if opw in time:
		# 	return {'status':'1', 'data':time[opw]}
		# else :
		# 	return {'status':'0', 'data':time2}
			
	
	return {'status':'0', 'data':time2}

@frappe.whitelist()
def get_purchase_order(docstatus):
	data = frappe.get_list('Purchase Order',filters={'docstatus': docstatus},fields=['*'])
	return data

@frappe.whitelist()
def get_all_data(doctype,start,page_length,fields,order_by,filters,group_by=''):	
	data = frappe.get_all(doctype, 
		filters=filters,
		start=start, 
		page_length=page_length, 
		fields=fields, # "name, hub_category"
		order_by= order_by,  # 'creation desc'
		group_by=group_by,
		)
		
	_filters = json.loads(filters) # convert json to object
	total_data = frappe.db.count(doctype,_filters)

	return {'data':data,
			'total_data':total_data,
			'filters':filters,
			'start':start,
			'page_length':page_length,
			'fields':fields,
			'order_by':order_by
			}

@frappe.whitelist()
def get_data_detail(doctype,id):
	try:
		data = frappe.get_doc(doctype, id)
		return {'data':data}
	except Exception as e:
		return {'data': []}
		pass