var xxx = 0;
var total_row = 0;
var total_page = 1;
var _status = ''

// frappe.ui.form.on('Work Order', {
// 	refresh: function (frm, cdt, cdn) {
// 		// console.log(frm.doc)
// 		var qty = parseInt(frm.doc.qty);
// 		var mtfm = parseInt(frm.doc.material_transferred_for_manufacturing);
// 		var produced_qty = parseInt(frm.doc.produced_qty);
// 		console.log('qty : '+qty)
// 		console.log('mtfm : '+mtfm)
// 		console.log('produced_qty : '+produced_qty)
// 		if(produced_qty>0){
// 			var completed_btn = frm.add_custom_button(__('Completed'), function() {
// 				frappe.confirm(
// 					__('Completed permanent Work Order <b>{0}</b>?', [frm.doc.name]),
// 					function(){						
// 						console.log('Thanks for continue here!')
// 						frappe.call({
// 							method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.updateStatus",
// 							args: {
// 								doctype:'Work Order',
// 								id:frm.doc.name,
// 								status:'Completed'
// 							},
// 							callback: function(r) {
// 								frm.reload_doc();
// 							}
// 						});
// 					},
// 					function(){
// 						console.log('Close!')
// 					}
// 				)
// 			});
// 			completed_btn.addClass('btn-success');
// 		}
// 	}
// })

frappe.ui.form.on('Job Card', {

	// after_save: function(frm) {
	// 	if(frm.doc.status != 'Completed') {
	// 		frappe.call({
	// 			method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.sendToQC",
	// 			args: {job_id:frm.doc.name,status:_status},
	// 			callback: function(r) {
	// 				frm.reload_doc();
	// 			}
	// 		});
	// 	}		
	// },
	refresh: function (frm, cdt, cdn) {
		// _status = frm.doc.status
		console.log(frm.doc)
		// frm.disable_submit();
		// if(frm.doc.status != 'Send to QC' && frm.doc.docstatus == 0){
		// cur_frm.page.add_action_item(__("Send to QC"), function() {
		// 	frappe.call({
		// 		method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.sendToQC",
		// 		args: {job_id:frm.doc.name,status:'Send to QC'},
		// 		callback: function(r) {
		// 			frm.reload_doc();
		// 		}
		// 	});
		// });
		// }
		// if(frm.doc.status == 'Send to QC' && frm.doc.docstatus == 0){
		// cur_frm.page.add_action_item(__("Work In Progress"), function() {
		// 	frappe.call({
		// 		method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.sendToWIP",
		// 		args: {job_id:frm.doc.name,status:'Work In Progress'},
		// 		callback: function(r) {
		// 			frm.reload_doc();
		// 		}
		// 	});
		// });
		// }

		// if(frm.doc.status == 'Send to QC'){
		// 	$('[data-label="Send to QC"]').closest('li.user-action').css('display','none');
		// 	$('[data-label="Work In Progress"]').closest('li.user-action').css('display','');
		// } else {
		// 	$('[data-label="Submit"]').parent().css('display','');
		// } 
		
		// if(frm.doc.status == 'Work In Progress'){
		// 	$('[data-label="Work In Progress"]').closest('li.user-action').css('display','none');
		// 	$('[data-label="Send to QC"]').closest('li.user-action').css('display','');
		// } else {
		// 	$('[data-label="Submit"]').parent().css('display','');
		// }

		// if(frm.doc.status != 'Work In Progress' && frm.doc.status != 'Send to QC'){
		// 	$('[data-label="Work In Progress"]').closest('li.user-action').css('display','none');
		// 	$('[data-label="Send to QC"]').closest('li.user-action').css('display','');
		// }
		
		// if(frm.doc.docstatus === 1){
		// 	$('[data-label="Send to QC"]').parents('.actions-btn-group').css('display','none');
		// } else {
		// 	$('[data-label="Send to QC"]').parents('.actions-btn-group').css('display','');
		// }
			
		
		// var color = {'Completed':'green','Work In Progress':'yellow','Send to QC':'blue'}
		// cur_frm.page.set_indicator(frm.doc.status,color[frm.doc.status])
		not_good(frm, cdt, cdn)
		xxx++;
		// event_modal(frm, cdt, cdn, xxx)

			
	},
	before_submit:function(frm, cdt, cdn){
		// console.log("before_submit : " + cur_frm.doc)
		// console.log(frm.doc)			
	},	
	before_remove: function(listview) {
		// console.log(111111111)
		// msgprint("Before Remove Called!");		
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
	}

});


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


frappe.ui.form.on('Stock Entry', {
	refresh: function (frm, cdt, cdn) {
		var data = frm.doc;
		var item_code = '';
		var work_order = data.work_order;
		var job_card = data.job_card;
		var item;
		var batch_no;
		filters = {
			"work_order": ["=",work_order]
			}
		$.each(data.items || [], function(k,v){
			if(v['t_warehouse']){
				item_code = v['item_code'];
				if(job_card === null){
					frappe.model.with_doc("Job Card", filters, function(){
						// console.log(filters)
						item = frappe.db.get_value("Job Card",filters,['name','workstation','posting_date','shift'], as_dict=false, order_by='creation asc').done(function(data){							
							batch_id = data.message.posting_date+'/'+data.message.shift+'/'+data.message.workstation;
							console.log(batch_id)
							frappe.call({
								method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.insert_batch_no",
								args: {
									batch_id:batch_id,
									item:item_code
								},
								callback: function(r) {
									console.log(v)
									// cur_frm.set_value('items', total_completed_qty)
									frappe.model.set_value(v.doctype, v.name, "batch_no", batch_id)
									frm.reload_doc();
								}
							});
						});
						// console.log(item)
						
					})
				}
			}
		})

	}
})

frappe.ui.form.on('BOM', {
	refresh: function (frm, cdt, cdn) {
		// console.log(frm.doc.items)
		// console.log(frm.doc.items.length)
		
		var _table = "<table class='table table-time-cycle table-bordered'><thead><tr>"+
			"<th>BOM No.</th>"+
			"<th>Item Code</th>"+
			"<th>Qty</th>"+
			"<th>UOM</th>"+
			"</tr></thead> <tbody>";

		// var _table = '<div class="form-grid">'+
		// 	'<div class="grid-heading-row">'+
		// 		'<div class="grid-row">'+
		// 			'<div class="data-row row">'+
		// 				'<div class="col grid-static-col col-xs-3 " data-fieldname="bom_no" data-fieldtype="Link">'+
		// 					'<div class="field-area" style="display: none;"></div>'+
		// 					'<div class="static-area ellipsis">BOM No.</div>'+
		// 				'</div>'+
		// 				'<div class="col grid-static-col col-xs-4 " data-fieldname="item_code" data-fieldtype="Link">'+
		// 					'<div class="field-area" style="display: none;"></div>'+
		// 					'<div class="static-area ellipsis">Item Code</div>'+
		// 				'</div>'+
		// 				'<div class="col grid-static-col col-xs-3  text-right" data-fieldname="qty" data-fieldtype="Float">'+
		// 					'<div class="field-area" style="display: none;"></div>'+
		// 					'<div class="static-area ellipsis">Qty</div>'+
		// 				'</div>'+
		// 				'<div class="col grid-static-col col-xs-2 " data-fieldname="uom" data-fieldtype="Link" style="border-right:none;">'+
		// 					'<div class="field-area" style="display: none;"></div>'+
		// 					'<div class="static-area ellipsis">UOM</div>'+
		// 				'</div>'+
							
		// 			'</div>'+
		// 		'</div>'+
		// 	'</div>';	
		// _table += '<div class="grid-body">'+
		// 			'<div class="rows">'+
		// 				'<div class="grid-row" data-name="dcefba9323" data-idx="1">'+
		// 					'<div class="data-row row">';	
		var datas;
		var data_items = 'bom-no';
		$.each(frm.doc.items, function(k,v){
			if(v.item_code){
				data_items += '-_-'+v.item_code;
			}			
		})
		console.log(data_items)
		if(data_items.length){
			frappe.call({
				method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.get_bom_with_item",
				args: {
					items:data_items
				},
				callback: function(res) {
					datas = res.message.data
					console.log(datas)
					if(datas.length){
						$.each(datas, function(k,v){
							// _table += '<div class="col grid-static-col col-xs-3  bold" data-fieldname="bom_no" data-fieldtype="Link">'+											
							// 					'<a class="grey" href="#Form/BOM/'+v.name+'" data-doctype="BOM" data-name="'+v.name+'">'+
							// 					v.name
							// 					'</a>'+
							// 			'</div>';
							// _table += '<div class="col grid-static-col col-xs-3  bold" data-fieldname="item_code" data-fieldtype="Link">'+											
							// 					'<a class="grey" href="#Form/Item/'+v.item+'" data-doctype="Item" data-name="'+v.item_name+'">'+
							// 					v.item+':'+ v.item_name
							// 					'</a>'+
							// 			'</div>';
							_table += '<tr><td><a class="grey" href="#Form/BOM/'+v.name+'" data-doctype="BOM" data-name="'+v.name+'">'+v.name+'</a></td>'+
							'<td><a class="grey" href="#Form/Item/'+v.item+'" data-doctype="Item" data-name="'+v.item_name+'">'+v.item+':'+ v.item_name+'</a></td>'+
							'<td>'+v.quantity+'</td>'+
							'<td>'+v.uom+'</td></tr>';
						})						
					}else {
						_table += '<tr><td colspan="4" class="grid-empty text-center">No Data</td></tr>';
					}
					// frm.reload_doc();
				}
			});
		}
		
		
		setTimeout(function(){
			_table += "</tbody></table>";
			// _table += "</div></div></div></div></div>";
			$('body').find('[data-fieldname="childs"]').html(_table)
		},1000)
		
	}
})