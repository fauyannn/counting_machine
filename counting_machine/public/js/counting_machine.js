var xxx = 0;
frappe.ui.form.on('Job Card', {
	refresh: function (frm, cdt, cdn) {
		not_good(frm, cdt, cdn)
		xxx++;
		// if(xxx <= 1){
			event_modal(frm, cdt, cdn, xxx)
		// }		
	}
});


// frappe.ui.form.on('Job Card Time Log', {
// 	not_good: function (frm, cdt, cdn) { 
	function not_good(){
		$(document).on('keyup','div[data-fieldname="time_logs"] input[data-fieldname="not_good"]', function(frm, cdt, cdn){
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
		
		
		// $('div[data-fieldname="time_logs"]').on('click','a.btn-open-row span.octicon',function(){
			
	// },
	// onload: function (frm, cdt, cdn) {
	// 	console.log(322)
	}
	// }
// });

	function event_modal(frm, cdt, cdn,xxx){	
		console.log('before click : '+xxx);
		$(document).find('div[data-fieldname="time_logs"] a.btn-open-row span.octicon').on('click',function(){
			
			if(xxx){			
				console.log('after click : '+xxx);
				var $this = $(this);
				var $parent = $this.closest('.grid-row');
				var job_id = cdn;
				var idx = $parent.data('idx');

				setTimeout(function(){
					$this.parents('html').find('.form-in-grid [data-fieldname="time_cycle"]').html('<center>Loading...</center>')
				},100)
				
			
				$.ajax({
					url:'/api/method/counting_machine.counting_machine.doctype.counting_machine.counting_machine.get_time_cycle',
					dataType:'json',
					type:'GET',
					data:{job_id:job_id,time_log_id:idx},				
					success : function(data){
						var _table = '<table class="table table-bordered">'+
								'<thead>'+
									'<tr>'+
										'<th>No</th>'+
										'<th>Time</th>'+
										'<th>Time In Seconds</th>'+
									'</tr>'+
								'</thead>'+
								'<tbody>';
						if(data.message.total_data){
							
							$.each(data.message.doc,function(i, d){
								_table += '<tr>'+
										'<td align="center">'+(i+1)+'</td>'+
										'<td align="left">'+d['time']+'</td>'+
										'<td align="left">'+d['time_in_seconds']+'</td>'+									
									'</tr>';
							})					
						} else {
							_table += '<tr>'+
								'<td colspan="3" align="center">no data found.</td>'+
							'</tr>';
						}
						_table += '</tbody>'+
								'</table>';
						setTimeout(function(){
							$this.parents('html').find('.form-in-grid [data-fieldname="time_cycle"]').html(_table)
						},1000)
					}

				})		
			// console.log('_req : ' + _req)		
			}
		})
	}	

	// $(document).ready(function(){
		// 	var total_time_log = $('div[data-fieldname="time_logs"] .rows .grid-row').length
		// 	console.log('total_time_log : '+total_time_log);
		// 	var _select = '<select class="form-control"><option value="0"></option>';

		// 	for(var i = 1; i <=total_time_log; i++){
		// 		_select += '<option value="'+i+'">'+i+'</option>';
		// 	}
		// 	_select += '</select>'
		// 	$('div[data-fieldname="select_time_log"]').html(_select)
		// 	console.log(cdn)
		// 	$(document).on('change','select[data-fieldname="select_time_log"]',function(){
		// 		// $('.form-in-grid [data-fieldname="time_cycle"]').html('<center>Loading...</center>')
		// 		var $this = $(this);
		// 		var job_id = $this.parents('body').data('route').split('/');
		// 			job_id = job_id[2];
		// 		var idx = $this.val();
		// 		var _req = null;
		// 		console.log(job_id+' --- '+idx);
		// 	})

		// })

