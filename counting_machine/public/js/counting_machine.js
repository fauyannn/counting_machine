var xxx = 0;
var total_row = 0;
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
		var limit_page_length = 10;
		var job_id = cdn;
		var limit_start = 0;
		$(document).find('div[data-fieldname="time_logs"] a.btn-open-row span.octicon').on('click',function(){
			limit_start = 0;
			if(xxx){			
				console.log('after click : '+xxx);
				var $this = $(this);
				var $parent = $this.closest('.grid-row');
				var idx = $parent.data('idx');
				var nextpage = 2;


				setTimeout(function(){
					$this.parents('html').find('.form-in-grid [data-fieldname="time_cycle"]').html('<center>Loading...</center>')
				},100)
				
				get_data(job_id,idx,limit_start,limit_page_length,$this,'load',nextpage);
						
			}
		})

		$(document).on('click','button.my-btn-more',function(){
			var $this = $(this);
			// var $parent = $this.closest('.grid-row');
			var idx = $this.data('idx');
			var page = $this.data('nextpage')
			var nextpage = parseInt(page + 1);
				limit_start = parseInt(limit_start + limit_page_length);
			
			$this.parents('html').find('.list-paging-area .level-right button').html('Loading...')
			
			
			get_data(job_id,idx,limit_start,limit_page_length,$this,'more',nextpage);
		})
	}	

	function get_data(job_id,idx,limit_start,limit_page_length,$this,_status,nextpage){
		var _table = '<table class="table table-time-cycle table-bordered">'+
						'<thead>'+
							'<tr>'+
								'<th>No</th>'+
								'<th>Time</th>'+
								'<th>Time In Seconds</th>'+
							'</tr>'+
						'</thead>'+
						'<tbody>';

		var data_table = '';
		
		var end_table = '</tbody>'+
						'</table>';

		var pagination_table = '<div class="list-paging-area level" style="">'+
				'<div class="level-left">'+
					'<div class="btn-group">'+						
							// '<button type="button" class="btn btn-default btn-sm btn-paging btn-info" data-value="20">20</button>'+
							// '<button type="button" class="btn btn-default btn-sm btn-paging" data-value="100">100</button>'+						
							// '<button type="button" class="btn btn-default btn-sm btn-paging" data-value="500">500</button>'+						
					'</div>'+
				'</div>'+
				'<div class="level-right">'+
					'<button class="btn btn-default btn-more btn-sm my-btn-more" data-nextpage="'+nextpage+'" data-idx="'+idx+'">'+
						'More...'+
					'</button>'+
				'</div>'+
			'</div>';		
		$.ajax({
			url:'/api/method/counting_machine.counting_machine.doctype.counting_machine.counting_machine.get_time_cycle',
			dataType:'json',
			type:'GET',
			data:{job_id:job_id,time_log_id:idx, limit_start:limit_start, limit_page_length:limit_page_length},				
			success : function(data){
				
				if(data.message.total_data){
					total_row = data.message.total_data;
					var no = 0;
					$.each(data.message.doc,function(i, d){
						no = parseInt(i + 1 + limit_start);
						data_table += '<tr>'+
								'<td align="center">'+no+'</td>'+
								'<td align="left">'+d['time']+'</td>'+
								'<td align="left">'+d['time_in_seconds']+'</td>'+									
							'</tr>';
					})					
				} else {
					data_table += '<tr>'+
						'<td colspan="3" align="center">no data found.</td>'+
					'</tr>';
				}
				
				setTimeout(function(){
					if(_status == 'load'){
						$this.parents('html').find('.form-in-grid [data-fieldname="time_cycle"]')
						.html(_table+data_table+end_table+pagination_table)
					} else {
						$this.parents('html').find('.table-time-cycle tbody')
						.append(data_table)
						$this.parents('html').find('.list-paging-area .level-right button').html('More...')
					}

					if(data.message.total_data <= no){
						$this.parents('html').find('.list-paging-area .level-right button').hide()
					}
					
				},1000)
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

