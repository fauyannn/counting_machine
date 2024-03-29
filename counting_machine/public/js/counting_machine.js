var xxx = 0;
var total_row = 0;
var total_page = 1;
var _status = '';
var req = false;
var datas = [];

frappe.ui.form.on('Job Card', {
	refresh: function (frm, cdt, cdn) {
		// _status = frm.doc.status
		// console.log(frm.doc)
		setTimeout(function(){
			$(document).find('span[data-label="Send to QC"]').closest('li.user-action').show();
			if(frm.doc.job_started){
				// console.log(frm.doc.job_started)
				$(document).find('span[data-label="Send to QC"]').closest('li.user-action').hide();
			}
			if(frm.doc.docstatus == 1){
				$('span[data-label="Cancel"]').parent().removeClass('hide');
				$('span[data-label="Cancel"]').parent().addClass('my-cancel-button');
				$(document).off();
				$(document).on('click','.my-cancel-button', function(){
					cancel_button(frm,cdt,cdn)
				})
			}

			get_jobcard_error_log(frm,cdt,cdn)
			
		},1000)
		
		if(frm.doc.bom_no != undefined && frm.doc.docstatus==0){
			req = frappe.call({
				method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.get_time_cycle2",
				args: {
					bom_no:frm.doc.bom_no,
					operation:frm.doc.operation,
					workstation:frm.doc.workstation
				},
				callback: function(res) {	
					req = false;
					datas = res.message
					// console.log(datas)
                	cur_frm.set_value('ideal_cycle_time_in_secs', datas.data)
					// $(document).find('input[data-fieldname="ideal_cycle_time_in_secs"]').val(datas.data);
				}
			});
		}
		// bom_no = 
		not_good(frm, cdt, cdn)
		save_production_item(frm,cdt,cdn)
		xxx++;		


		// complete job via andon and counter machine
		// setTimeout(function(){
		// 	if($(document).find('button[data-label="Complete%20Job"]').length){				
		// 		var new_button = '<button data-label="complete_job" class="btn btn-default btn-xs" style="margin-left: 10px;">Complete Job</button>';
		// 		$(document).find('button[data-label="Complete%20Job"]').hide().after(new_button);
		// 	}
		// 	$(document).find('button[data-label="complete_job"]').on('click',function(e){
		// 		e.preventDefault();
		// 		msgprint("Please complete job card via counter machine or andon system");
		// 		return false;
		// 	});
		// },2000)		
		
	},
	// before_submit:function(frm, cdt, cdn){
	// 	console.log(frm.doc)
	// },	
	before_save: function(frm, cdt, cdn) {
		if (frm.doc.input < 1) {
			msgprint("The field <b>input</b> must be greater than 0");
			validated = false;
		} else if(frm.doc.output < 1){
			msgprint("The field <b>output</b> must be greater than 0");
			validated = false;
		} else if(frm.doc.planned_production_time_in_mins < 1){
			msgprint("The field <b>Planned Production Time in Mins</b> must be greater than 0");
			validated = false;
		} else if(frm.doc.ideal_cycle_time_in_secs < 1){
			msgprint("The field <b>Ideal Cycle Time in Secs</b> must be greater than 0");
			validated = false;
		}
	},
	on_submit:function(frm,cdt,cdn){
		// console.log('on_submit : ' + cdn)
		var not_good = 0
		const datas = cur_frm.doc.time_logs
		datas.forEach(function(d, k){
			not_good += d.not_good
		})

		var args = {
			job_card: cur_frm.doc.name,
			workstation: cur_frm.doc.workstation,
			operation: cur_frm.doc.operation,
			quantity: not_good,
			company: cur_frm.doc.company,
			employee: cur_frm.doc.employee,
			work_order: cur_frm.doc.work_order,
		}
		// console.log(args)
		if(not_good > 0){
			frappe.call({
				method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.insert_not_good",
				args: args,
				callback: function(r) {
					frm.reload_doc();
				}
			});
		}

		save_batchno(frm,cdt,cdn);
		update_diesAndJig_totalStroke(frm,cdt,cdn);
	}

});

function update_diesAndJig_totalStroke(frm,cdt,cdn){
	var data = frm.doc;
	var item = data.production_item;
	var jc_actual = 0;
	var total_stroke = 0;

	if(data.time_logs.length){
		$.each(data.time_logs, function(k,v){
			jc_actual += v.actual;
		})
	}
	req = frappe.call({
		method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.auto_update_total_stroke",
		args: {
			item_code:item,
			jc_actual:jc_actual
		},
		callback: function(res) {
			datas = res.message
			// console.log(res)
		}
	});
	

	// console.log('jc_actual : '+jc_actual);
	// var filters = {
	// 	"item_name": ["=",item],
	// 	"docstatus": ["=",1]
	// }
	// frappe.model.with_doc("Dies and Jig", filters, function(){
	// 	frappe.db.get_value("Dies and Jig",filters,['name','item_name','total_stroke']).done(function(dt){
	// 		// console.log(dt.message)
	// 		if(dt.message){
	// 			total_stroke = parseInt(jc_actual + dt.message.total_stroke);
	// 			// console.log('total_stroke : '+total_stroke);
	// 			frappe.db.set_value("Dies and Jig", dt.message.name, "total_stroke", total_stroke)
	// 		}
	// 	})
	// })

}

function cancel_button(frm,cdt,cdn){
	// console.log(frm.doc)
	frappe.confirm(
		'Permanently Cancel '+cdn+'?',
		function(){
			frappe.call({
				method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.cancelButton",
				args: {
					doctype:cdt,
					id:cdn
				},
				callback: function(r) {
					console.log(r)
					// frappe.model.set_value(cdt, cdn, "docstatus", 2);
					show_alert(cdn+' has been cancelled');
					// window.close();
					frm.reload_doc();
				}
			});
		},
		function(){
			window.close();
		}
	)
	// frappe.model.set_value(cdt, cdn, "docstatus", 2);
}

function save_batchno(frm,cdt,cdn){
	var data = frm.doc
		var item_code = frm.doc.production_item;
		
		batch_id = data.posting_date+'/'+data.shift+'/'+data.workstation;
		frappe.call({
			method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.insert_batch_no",
			args: {
				batch_id:batch_id,
				item:item_code
			},
			callback: function(r) {
				console.log(r)
			}
		});
}

function save_production_item(frm,cdt,cdn){
	var data = frm.doc
	var production_item = '';
	// console.log(data);
	
	var filters = {
		"name": ["=",data.work_order]
	};
	frappe.model.with_doc("Work Order", filters, function(){
		// console.log(filters)
		frappe.db.get_value("Work Order",filters,['production_item']).done(function(d){							
			production_item = d.message.production_item;
			// console.log(production_item)
			frappe.model.set_value('Job Card', data.name, "production_item", production_item)
		})
	})
}

// frappe.ui.form.on('Job Card Time Log', {
// 	not_good: function (frm, cdt, cdn) { 
	function not_good(){
		$(document).off('keyup','div[data-fieldname="time_logs"] input[data-fieldname="not_good"], div[data-fieldname="time_logs"] input[data-fieldname="actual"]');
		$(document).on('keyup','div[data-fieldname="time_logs"] input[data-fieldname="not_good"], div[data-fieldname="time_logs"] input[data-fieldname="actual"]', function(frm, cdt, cdn){
			var $this = $(this);
			var $parent = $this.closest('.grid-row');
			var not_good = ($parent.find('input[data-fieldname="not_good"]').val()).replace('.','').replace('.','').replace('.','');
			var actual = ($parent.find('input[data-fieldname="actual"]').val()).replace('.','').replace('.','').replace('.','');
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
				completed_qty = ($(data).find('[data-fieldname="completed_qty"]').text()).replace('.','').replace('.','').replace('.','');
				console.log(completed_qty)
				$(data).find('[data-fieldname="completed_qty"]').val(parseInt(completed_qty))
				total_completed_qty += parseInt(completed_qty);
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
		// console.log('before click : '+xxx);
		var limit_page_length = 10;
		var job_id = cdn;
		var limit_start = 0;
		$(document).find('div[data-fieldname="time_logs"] a.btn-open-row span.octicon').off()
		$(document).find('div[data-fieldname="time_logs"] a.btn-open-row span.octicon').on('click', ':checkbox',function(){
			limit_start = 0;
			if(xxx){			
				// console.log('after click : '+xxx);
				var $this = $(this);
				var $parent = $this.closest('.grid-row');
				var idx = $parent.data('idx');
				var page = 1;


				setTimeout(function(){
					$this.parents('html').find('.form-in-grid [data-fieldname="time_cycle"]').html('<center>Loading...</center>')
				},100)
				
				get_data(job_id,idx,limit_start,limit_page_length,$this,'load',page);
						
			}
		})

		$(document).off('keyup','input[name="_page"]')
		$(document).on('keyup','input[name="_page"]', function(){
			var $this = $(this);
			var total_page = parseInt($this.parent().find('span.total-page').text());
			var page = parseInt($this.val());
			// console.log(page+"x"+total_page);
			if(page >= total_page){
				$this.val(total_page);
			}
		})

		$(document).off('click','button.my-btn-more');
		$(document).on('click','button.my-btn-more',function(){
			var $this = $(this);
			// var $parent = $this.closest('.grid-row');
			var idx = $this.data('idx');
			var page = $this.parent().find('input[name="_page"]').val();
			var nextpage = parseInt(page + 1);
				limit_start = parseInt((page*limit_page_length) - limit_page_length);
			
			$this.parents('html').find('.list-paging-area .level-right button').html('Loading...')			
			
			get_data(job_id,idx,limit_start,limit_page_length,$this,'more',page);
		});
	}	
	function get_data(job_id,idx,limit_start,limit_page_length,$this,_status,page){
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
					'Page:<input type="text" name="_page" class="form-control" style="width: 50px;" value="1"/> of &nbsp; <span class="total-page"> '+total_page+'</span>'+
					'<button style="margin-left:10px;" class="btn btn-default btn-more btn-sm my-btn-more" data-nextpage="" data-idx="'+idx+'">'+
						'Show'+
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
					total_page =  Math.ceil(total_row / limit_page_length);
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
					pagination_table = '';
				}
				
				setTimeout(function(){					
					$this.parents('html').find('.form-in-grid [data-fieldname="time_cycle"]')
					.html(_table+data_table+end_table+pagination_table).find('input[name="_page"]').val(page)
					if(_status == 'load'){
					} else {
						// $this.parents('html').find('.table-time-cycle tbody')
						// .append(data_table)
						$this.parents('html').find('.list-paging-area .level-right button').html('Show')
					}

					if(data.message.total_data <= no){
						$this.parents('html').find('.list-paging-area .level-right button').hide()
					}
					// $this.parents('html').find('[data-fieldname="time_cycle"]')
					// .find('input[name="_page"]').val(page)
				},1000)

				setTimeout(function(){
					$this.parents('html').find('.form-in-grid [data-fieldname="time_cycle"]')
					.find('span.total-page').text(total_page)					
				}, 1500)
			}

		})
	}

	function get_jobcard_error_log(frm,cdt,cdn){
		var _table = '<table class="table table-job-card-error-log table-bordered">'+
						'<thead>'+
							'<tr>'+
								'<th>No</th>'+
								'<th>Datetime</th>'+
								'<th>Message</th>'+
							'</tr>'+
						'</thead>'+
						'<tbody>';

		var data_table = '';
		
		var end_table = '</tbody>'+
						'</table>';
		$.ajax({
			url:'/api/resource/Job Card Error Log/?fields=["datetime","job_card","message"]&filters=[["job_card", "=", "'+frm.doc.name+'"]]&limit_page_length=5',
			dataType:'json',
			type:'GET',
			data:{},				
			success : function(data){
				// console.log(data)
				if(data.data.length){
					var no = 0;
					$.each(data.data,function(i, d){
						no = parseInt(i + 1);
						var dt = new Date(d['datetime']);
						var	date_time = moment(dt).format("DD-MM-YYYY HH:mm:ss");
						// var	date_time = appendZeroes(dt.getDate())+'-'+appendZeroes(parseInt(dt.getMonth()+1))+'-'+dt.getFullYear()+' '+appendZeroes(dt.getHours())+':'+appendZeroes(dt.getMinutes())+':'+appendZeroes(dt.getSeconds());
						data_table += '<tr>'+
								'<td align="center">'+no+'</td>'+
								'<td align="left">'+date_time+'</td>'+
								'<td align="left">'+d['message']+'</td>'+									
							'</tr>';
					})					
				} else {
					data_table += '<tr>'+
						'<td colspan="3" align="center">no data found.</td>'+
					'</tr>';
				}
				
				setTimeout(function(){					
					$('html').find('.form-column div[data-fieldname="error_logs"]')
					.html(_table+data_table+end_table)
					
				},1000)

			}

		})
	}
	function appendZeroes(n){
		if(n <= 9){
		  return "0" + n;
		}
		return n
	  }