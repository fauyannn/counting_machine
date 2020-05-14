# -*- coding: utf-8 -*-
# Copyright (c) 2020, PT. Cipta Dinamika Unggul and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import today

class DiesandJig(Document):
	def before_submit(self): 
		item_name = "%s-%s-%s" % (self.item_part, self.proses, self.item_name)
		# create item
		if not frappe.db.exists("Item Group", "Asset"):
			item_group = frappe.new_doc("Item Group")
			item_group.item_group_name = "Asset"
			item_group.insert(
				ignore_mandatory=True,
				ignore_if_duplicate=True
			)
		
		if not frappe.db.exists("Asset Category", "Dies and Jig"):
			asset_category = frappe.new_doc("Asset Category")
			asset_category.asset_category_name = "Dies and Jig"
			asset_category.flags.ignore_mandatory = True
			asset_category.flags.ignore_if_duplicate = True
			asset_category.insert(
				ignore_mandatory=True,
				ignore_if_duplicate=True
			)

		item = frappe.get_list("Item", filters={
            "item_code": item_name,
            "is_fixed_asset": 1
            })

		if not item:
			item = frappe.get_doc({
				"doctype":  "Item",
				"item_code": item_name,
				"is_stock_item": 0,
				"is_fixed_asset": 1,
				"asset_category": "Uncategorized",
				"item_group": "Asset"
			}).insert(ignore_mandatory=True, ignore_if_duplicate=True)
		else:
			item = item[0]

		#create asset
		asset = frappe.get_list("Asset", filters={
            "asset_name": item_name
            })

		if not asset:
			asset = frappe.get_doc({
				"doctype": "Asset",
				"asset_name": item_name,
				"item_code": item.item_code,
				"gross_purchase_amount": 1,
				"is_existing_asset": 1,
				"available_for_use_date": today()
			}).insert(ignore_mandatory=True, ignore_if_duplicate=True)
		else:
			asset = asset[0]
		
		# link new asset to this Dies
		self.asset_name = asset.name