// Copyright (c) 2020, PT. Cipta Dinamika Unggul and contributors
// For license information, please see license.txt

frappe.ui.form.on('Dies and Jig', {
	onload: function(frm) {
		frm.set_query("item", "consumable_item", function(doc, cdt, cdn) {
			return {
				filters: {
					item_group: "Consumable"
				}
			};
		});
	},
	tinggi_mata_potong: function(frm){
		dies_jig.calc_lifetime(frm);
	},
	step_down_grinding: function(frm){
		dies_jig.calc_lifetime(frm);
	},
	jumlah_stroke_hingga_dies_aus: function(frm){
		dies_jig.calc_lifetime(frm);
	},
	dies_tipe: function(frm){
		dies_jig.calc_lifetime(frm);
	}
});

var dies_jig = {};
dies_jig.calc_lifetime = function(frm){
	var life_time_ideal = 0;
	if(frm.doc.tinggi_mata_potong && frm.doc.step_down_grinding && frm.doc.jumlah_stroke_hingga_dies_aus) {
		var tipe_value = 1;
		switch(frm.doc.dies_tipe) {
			case "SPHC-P":
				tipe_value = 0.8;
				break;
			case "STAINLES":
			case "SK5":
			case "SKTM":
				tipe_value = 0.7;
				break;
		}
		life_time_ideal = ((frm.doc.tinggi_mata_potong / frm.doc.step_down_grinding) * frm.doc.jumlah_stroke_hingga_dies_aus) * tipe_value;
	}

	frm.set_value("life_time_ideal", life_time_ideal);
};
