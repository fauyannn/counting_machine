# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "counting_machine"
app_title = "Counting Machine"
app_publisher = "PT. Cipta Dinamika Unggul"
app_description = "Counting Machine Employee"
app_icon = "octicon octicon-file-directory"
app_color = "#589494"
app_email = "fauyannn@gmail.com"
app_license = "GNU General Public License"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/counting_machine/css/counting_machine.css"
app_include_css = [
    "/assets/css/jquery.treegrid.min.css"
]
app_include_js = [
    "/assets/js/counting_machine.js",
    "/assets/js/jquery.treegrid.min.js"
]

# include js, css files in header of web template
# web_include_css = "/assets/counting_machine/css/counting_machine.css"
# web_include_js = "/assets/counting_machine/js/counting_machine.js"

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"Job Card" : "/assets/counting_machine/js/job_card_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "counting_machine.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "counting_machine.install.before_install"
# after_install = "counting_machine.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "counting_machine.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"counting_machine.tasks.all"
# 	],
# 	"daily": [
# 		"counting_machine.tasks.daily"
# 	],
# 	"hourly": [
# 		"counting_machine.tasks.hourly"
# 	],
# 	"weekly": [
# 		"counting_machine.tasks.weekly"
# 	]
# 	"monthly": [
# 		"counting_machine.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "counting_machine.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "counting_machine.event.get_events"
# }
fixtures =  [
    {
    "doctype": "Print Format", 
    "filters": [[
      "name", "in", ("BOM Tree")
      ]]
    }
]
jenv = {
	"methods": [
		"get_bom_tree_all:counting_machine.counting_machine.doctype.counting_machine.counting_machine.get_bom_tree_all"
	]
}