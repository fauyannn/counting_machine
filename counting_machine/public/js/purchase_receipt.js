frappe.ui.form.on('Purchase Receipt', {
	refresh: function (frm, cdt, cdn) {
        console.log(frm.doc)
        // frappe.model.set_value('Purchase Receipt Item', '448d9f2fa0', 'batch_no', '2020-01-21/1234-90-90')
        
    },
    before_save: function(frm, cdt, cdn) {	
        // console.log("Before save!")
        var data = frm.doc;
        // console.log(data.items)
        var posting_date = data.posting_date;

        $.each(data.items || [], function(key,val){
            var bacth_no = posting_date+'/'+val.item_code;
            frappe.call({
                method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.insert_batch_no",
                args: {
                    batch_id:bacth_no,
                    item:val.item_code
                },
                callback: function(r) {
                    // console.log(r)
                    // console.log(val.doctype+' _ '+ val.name +' _ '+bacth_no)
                    if(r.batch_id){
                        frappe.model.set_value(val.doctype, val.name, 'batch_no', bacth_no)
                    }                    
                }
            });
        })
	}
})
frappe.ui.form.on('Item', {
	refresh: function (frm, cdt, cdn) {
        console.log(frm.doc)        
    }
})