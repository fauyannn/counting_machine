frappe.ui.form.on('Employee', {
    rf_id :function name(frm, cdt, cdn) {
        var rf_id = $('input[data-fieldname="rf_id"]').val();
        if(rf_id.length == 10){
            var hexString = parseInt(rf_id).toString(16);
            // var rf_id = parseInt(hexString, 16);
                hexString = hexString.padStart(8,'0');
                
            var hex = hexString.split('');
                hexString = hex[6]+hex[7]+' '+hex[4]+hex[5]+' '+hex[2]+hex[3]+' '+hex[0]+hex[1];
                hexString = hexString.toUpperCase();
            // console.log(hex);
            // console.log(yourNumber+' ____ '+hexString);
            cur_frm.set_value("rf_id", hexString);
        }
    }
})