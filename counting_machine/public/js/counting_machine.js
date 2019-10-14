
$('div[data-fieldname="time_logs"]').on('keyup','input[data-fieldname="not_good"]', function(frm, cdt, cdn){
	var $this = $(this);
	var $parent = $this.closest('.grid-row');
	var not_good = $this.val();
	var actual = $parent.find('input[data-fieldname="actual"]').val();
	var idx = $parent.data('idx');
	var row = idx-1;

	var completed_qty = parseInt(actual) - parseInt(not_good);

	if(completed_qty<0){
		$parent.find('input[data-fieldname="not_good"]').val(0);
		frappe.msgprint("not_good must be smaller or equal to actual");
		// return false;
	}
	completed_qty = parseInt(actual) - parseInt(not_good);
	cur_frm.get_field("time_logs").grid.grid_rows[row].doc.completed_qty = completed_qty
	cur_frm.get_field("time_logs").grid.grid_rows[row].refresh_field("completed_qty")

	//total_completed_qty
	var total_completed_qty = 0;
	var completed_qty = 0;
	$('div [data-fieldname="time_logs"]:first .rows .grid-row').each(function(index, data){	
		total_completed_qty += parseInt($(data).find('[data-fieldname="completed_qty"]').text());
	})
	// console.log(total_completed_qty)
	cur_frm.set_value('total_completed_qty', total_completed_qty)
});