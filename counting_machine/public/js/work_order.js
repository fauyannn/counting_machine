frappe.ui.form.on('Work Order', {
	refresh: function (frm, cdt, cdn) {
		var data = frm.doc;
		setCookie('berdikari_wo',data.name,9999);

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