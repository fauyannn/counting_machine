$.extend(frappe.breadcrumbs.preferred, {
	"Dice and Jig": "Manufacturing",
});

var data;
var $this;
frappe.ui.form.on('Dice and Jig', {
    // "link_to_items.bom": function(frm) {
    //     var data = frm.doc;
    //     console.log(data)
    // },
    refresh: function (frm, cdt, cdn) {
        data = frm.doc;
        console.log(data)

        auto_fill_remaining_time(data)
        $(document).off('keyup','input[data-fieldname="life_time"]');
        $(document).on('keyup','input[data-fieldname="life_time"]',function(){
            $this = $(this);

            var bom_no = $('body').find('div[data-fieldname="link_to_items"]:first')
                        .find('.grid-body')
                        .find('div.grid-row:first')
                        .find('div[data-fieldname="bom"]')
                        .find('div.static-area a')
                        .data('name');

            var life_time = $this.val();
            data.link_to_items[0].bom   = bom_no;
            data.life_time              = life_time.replace(',','.')
            
            auto_fill_remaining_time(data)
        })

        $(document).off('change','input[data-fieldname="bom"]');
        $(document).on('change','input[data-fieldname="bom"]',function(){
            $this = $(this);
            var bom_no = $this.val();
            console.log('bom_no : '+bom_no)
            var filters = {
                "name": ["=",bom_no]
            };
            frappe.model.with_doc("BOM", filters, function(){
                // console.log(filters)
                frappe.db.get_value("BOM",filters,['item','item_name']).done(function(d){	
                    if(d.message){                        				
                        var item        = d.message.item;
                        var item_name   = d.message.item_name;
                        var data_name   = $this.closest('div.grid-row').data('name');
                        console.log(item+' : '+item_name)
                        // $this.closest('div.grid-row').find('input[data-fieldname="item"]').val(item)
                        frappe.model.set_value('Dice and Jig Item', data_name, "item", item)
                        // frappe.model.set_value('Job Card', data.name, "production_item", production_item)
                    }		
                })
            })
        })
    }
})

function auto_fill_remaining_time(data){
    var bom = data.link_to_items[0].bom;
    if(bom==undefined || bom==''){return false;}
    var filters = {
        "bom_no": ["=",bom]
    }
    frappe.model.with_doc("Job Card", filters, function(){
        // console.log(filters)
        var _field = ['name','total_time_in_mins','total_setup_time_in_mins','total_stop_time_in_mins','total_hold_time_in_mins']
        frappe.db.get_value("Job Card",filters,_field).done(function(res){
            var dt = res.message;
            // console.log(res)
            if(dt==undefined){
                cur_frm.set_value('remaining_time', 0)
            } else {
                var job_card_time = dt.total_time_in_mins - dt.total_stop_time_in_mins - dt.total_hold_time_in_mins - dt.total_setup_time_in_mins;
                    job_card_time = job_card_time / 60; // convert mins to hours 

                var life_time       = data.life_time;
                var remaining_time  = (life_time - job_card_time);
                cur_frm.set_value('remaining_time', remaining_time)
            }            
            // console.log(life_time+' - '+job_card_time+' = '+remaining_time)
        })
    })
}