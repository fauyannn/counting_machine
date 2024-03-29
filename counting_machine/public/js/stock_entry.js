frappe.ui.form.on('Stock Entry', {
	"stock_entry_type": function(frm) {
		var data = frm.doc;
		var work_order = $(document).find('input[data-fieldname="w_o"]').val();		
		$(document).find('input[data-fieldname="work_order"]').val(work_order);
    },
	refresh: function (frm, cdt, cdn) {
		var data = frm.doc;
		var work_order = data.work_order;
		if(!work_order || work_order == undefined){
			work_order = getCookie('berdikari_wo')
		}
		// console.log('wo : '+ getCookie('berdikari_wo'))
		setTimeout(function(){
			$(document).find('input[data-fieldname="w_o"]').val(work_order);
		},1000)
	},
    before_save: function(frm, cdt, cdn) {	
		// console.log("Before save!")
    },
    before_submit:function(frm,cdt,cdn){
		var data = frm.doc;
		var work_order = data.work_order;
		// console.log(data)
		var item_code = '';
		var job_card = data.job_card_reference;
		var item;
		var items = [];
		var batch_no = [];
		var batch_id = '';
		var ng = '';
		var filters;
		var reference_purchase_receipt = false;
		if(job_card === null || job_card == undefined){
			filters = {
				"work_order": ["=",work_order]
			}
		} else {
			filters = {
				"name": ["=",job_card]
			}
		}
		if(data.stock_entry_type == 'Manufacture') {
			console.log('AUTO GENERATE BATCH_NO, just type manufacture and target waarehouse != null');
			$.each(data.items || [], function(k,v){
				// console.log(v)
				items[v.item_code] = v.name;
				if(v['t_warehouse'] && !v.batch_no){
					item_code = v['item_code'];
					// if(job_card === null || job_card == undefined){
						frappe.model.with_doc("Job Card", filters, function(){
							// console.log(filters)
							item = frappe.db.get_value("Job Card",filters,['name','workstation','posting_date','shift']).done(function(dt){							
								// console.log(dt.message)
								var parts = dt.message.posting_date.split('-');
								var dmyDate = parts[2] + '-' + parts[1] + '-' + parts[0];
								var ng_warehouse = v['t_warehouse'].split(' NG ');
								// console.log(ng_warehouse.length);
									
								ng = (ng_warehouse.length > 1) ? 'NG/' : '';
								batch_id = ng+dmyDate+'/'+dt.message.shift+'/'+dt.message.workstation+'/'+item_code;
								
								// console.log(batch_id);
								// wait timer(3000);
								frappe.call({
									method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.insert_batch_no",
									args: {
										batch_id:batch_id,
										item:item_code,
										doctype:frm.doc.doctype,
										docname:frm.doc.name
									},
									callback: function(r) {
										// console.log(v)
										ng = (ng_warehouse.length > 1) ? 'NG/' : '';
										batch_id = ng+dmyDate+'/'+dt.message.shift+'/'+dt.message.workstation+'/'+item_code;
								
										// cur_frm.set_value('items', total_completed_qty)
										frappe.model.set_value(v.doctype, v.name, "batch_no", batch_id)
										// frm.reload_doc();
									}
								});
							});						
						})
					// }
				}
				if(v['reference_purchase_receipt']){
					reference_purchase_receipt = v.reference_purchase_receipt				
				}
			})
		}
		if(reference_purchase_receipt){				
			filters = {
				"name": ["=",reference_purchase_receipt]
			}
			var _doc;
			// console.log('test1 : '+reference_purchase_receipt)
			_doc = frappe.get_doc("Purchase Receipt",reference_purchase_receipt);
			$.each(_doc.items || [], function(k,v){
				// batch_no[v.item_code] = v.batch_no
				// console.log('__ : '+items[v.item_code])
				frappe.model.set_value("Stock Entry Detail", items[v.item_code], "batch_no", v.batch_no)
			})
			// console.log(_doc.items)			
		}	
	}
})
function setCookie(name,value,days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
function eraseCookie(name) {   
	document.cookie = name+'=; Max-Age=-99999999;';  
}