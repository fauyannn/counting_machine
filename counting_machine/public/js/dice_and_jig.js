var data;
frappe.ui.form.on('Dice and Jig', {
    refresh: function (frm, cdt, cdn) {
        data = frm.doc;
        console.log(data)

        auto_fill_remaining_time(data)
        $(document).off('keyup','input[data-fieldname="life_time"]');
        $(document).on('keyup','input[data-fieldname="life_time"]',function(){
            var $this = $(this);

            var bom_no = $('body').find('div[data-fieldname="link_to_items"]:first')
                        .find('.grid-body')
                        .find('div.grid-row:first')
                        .find('div[data-fieldname="bom"]')
                        .find('div.static-area a')
                        .data('name');

            var life_time = $this.val();
            // console.log(bom_no)
            // console.log('bom : '+bom_no)
            data.link_to_items[0].bom   = bom_no;
            data.life_time              = life_time.replace(',','.')
            // console.log(data)
            // console.log('xx = '+$this.val())
            auto_fill_remaining_time(data)
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
            var job_card_time = dt.total_time_in_mins - dt.total_stop_time_in_mins - dt.total_hold_time_in_mins - dt.total_setup_time_in_mins;
                job_card_time = job_card_time / 60; // convert mins to hours

            var life_time = data.life_time;
            var remaining_time = (life_time - job_card_time);
            $('[data-fieldname="remaining_time"]').val(remaining_time);
            console.log(res)            
        })
    })
}