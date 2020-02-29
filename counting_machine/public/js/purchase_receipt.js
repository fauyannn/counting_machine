frappe.ui.form.on('Purchase Receipt', {
    "System Settings": function(frm) {
        var test = frm.add_fetch("System Settings", "country", "supplier_delivery_note");
        console.log("zz : "+test)
    },
	refresh: function (frm, cdt, cdn) {
        // console.log(frm.doc)
        // frappe.model.set_value('Purchase Receipt Item', '448d9f2fa0', 'batch_no', '2020-01-21/1234-90-90')
        
    },
    before_save: function(frm, cdt, cdn) {	
        // console.log("Before save!")
        var data = frm.doc;
        // console.log(data.items)
        var posting_date = data.posting_date;

        
        // var test = cur_frm.add_fetch("System Settings","country","country");

        insert_invoice_portal(frm,cdt,cdn);
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
    },
    on_submit:function(frm,cdt,cdn){
        // insert_invoice_portal(frm,cdt,cdn);
    }
})

function insert_invoice_portal(frm,cdt,cdn){
    var data = frm.doc;    
    frappe.call({
        method: 'frappe.client.get_value',
        args: {
            'doctype': 'QR Portal Setting',
            // 'filters': {'name': item_code},
            'fieldname': [
                'url',
                'api_secret'
            ]
        },
        callback: function(r) {
            if (!r.exc) {
                // return r.message;
                var data = r.message;
                insert_invoice(data)
            }
        }
    });
}

function insert_invoice(data){
    console.log('after submit')
    // console.log(data)
    var url = data.url+'/api/create_invoice';
    var apiS = data.api_secret;
    fetch(url, {
        method: 'POST',
        headers: {
            'X-Authorization-Token': apiS,
            'X-Authorization-Time' : $.now()
        },
        body: JSON.stringify({
            'supplier': 'INDTA PRATAMAJAYA',
            'items': [{"purchase_order_number":"123213","item_code":"1234","item_name":"Besi","uom":"pieces","qty":"100","rate":"10000","amount":"1000000"}]

        })
    })
    .then(r => r.json())
    .then(r => {
        console.log(r);
    })
}

