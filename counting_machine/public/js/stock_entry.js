frappe.ui.form.on('Stock Entry', {
	"stock_entry_type": function(frm) {
		var data = frm.doc;
		var work_order = $(document).find('input[data-fieldname="w_o"]').val();
		$(document).find('input[data-fieldname="work_order"]').val(work_order);
    },
	refresh: function (frm, cdt, cdn) {
		var data = frm.doc;
		var item_code = '';
		var work_order = data.work_order;
		var job_card = data.job_card;
		var item;
        var batch_no;
        var filters;
		if(job_card === null || job_card == undefined){
			filters = {
				"work_order": ["=",work_order]
			}
		} else {
			filters = {
				"name": ["=",job_card]
			}
		}
		setTimeout(function(){
			$(document).find('input[data-fieldname="w_o"]').val(work_order);
		},1000)
		// console.log(work_order)
		$.each(data.items || [], function(k,v){
			if(v['t_warehouse']){
				item_code = v['item_code'];
				// if(job_card === null || job_card == undefined){
					frappe.model.with_doc("Job Card", filters, function(){
						// console.log(filters)
						item = frappe.db.get_value("Job Card",filters,['name','workstation','posting_date','shift'], as_dict=false, order_by='creation asc').done(function(data){							
							// console.log(data.message)
							batch_id = data.message.posting_date+'/'+data.message.shift+'/'+data.message.workstation;
							// console.log(batch_id)
							frappe.call({
								method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.insert_batch_no",
								args: {
									batch_id:batch_id,
									item:item_code
								},
								callback: function(r) {
									// console.log(v)
									// cur_frm.set_value('items', total_completed_qty)
									frappe.model.set_value(v.doctype, v.name, "batch_no", batch_id)
									// frm.reload_doc();
								}
							});
						});						
					})
				// }
			}
		})

	}
})