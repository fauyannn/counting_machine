frappe.ui.form.on('Work Order', {
	refresh: function (frm, cdt, cdn) {
		console.log(frm.doc)
		// var qty = parseInt(frm.doc.qty);
		// var mtfm = parseInt(frm.doc.material_transferred_for_manufacturing);
		// var produced_qty = parseInt(frm.doc.produced_qty);
		// console.log('qty : '+qty)
		// console.log('mtfm : '+mtfm)
		// console.log('produced_qty : '+produced_qty)
		// if(produced_qty>0){
		// 	var completed_btn = frm.add_custom_button(__('Completed'), function() {
		// 		frappe.confirm(
		// 			__('Completed permanent Work Order <b>{0}</b>?', [frm.doc.name]),
		// 			function(){						
		// 				console.log('Thanks for continue here!')
		// 				frappe.call({
		// 					method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.updateStatus",
		// 					args: {
		// 						doctype:'Work Order',
		// 						id:frm.doc.name,
		// 						status:'Completed'
		// 					},
		// 					callback: function(r) {
		// 						frm.reload_doc();
		// 					}
		// 				});
		// 			},
		// 			function(){
		// 				console.log('Close!')
		// 			}
		// 		)
		// 	});
		// 	completed_btn.addClass('btn-success');
		// }
	}
})