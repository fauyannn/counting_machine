var xxx = 0;
var total_row = 0;
var total_page = 1;
var _status = ''

frappe.ui.form.on('Work Order', {
	refresh: function (frm, cdt, cdn) {
		console.log(frm.doc)
		// var qty = parseInt(frm.doc.qty);
		// var mtfm = parseInt(frm.doc.material_transferred_for_manufacturing);
		// var produced_qty = parseInt(frm.doc.produced_qty);
		// console.log('qty : '+qty)
		// console.log('mtfm : '+mtfm)
		// console.log('produced_qty : '+produced_qty)
		// if(produced_qty>0){
		// 	var completed_btn = frm.add_custom_button(__('Completed'), function() {
		// 		frappe.confirm(
		// 			__('Completed permanent Work Order <b>{0}</b>?', [frm.doc.name]),
		// 			function(){						
		// 				console.log('Thanks for continue here!')
		// 				frappe.call({
		// 					method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.updateStatus",
		// 					args: {
		// 						doctype:'Work Order',
		// 						id:frm.doc.name,
		// 						status:'Completed'
		// 					},
		// 					callback: function(r) {
		// 						frm.reload_doc();
		// 					}
		// 				});
		// 			},
		// 			function(){
		// 				console.log('Close!')
		// 			}
		// 		)
		// 	});
		// 	completed_btn.addClass('btn-success');
		// }
	}
})

frappe.ui.form.on('Job Card', {
	refresh: function (frm, cdt, cdn) {
		// _status = frm.doc.status
		setTimeout(function(){
			$(document).find('span[data-label="Send to QC"]').closest('li.user-action').show();
			if(frm.doc.job_started){
				console.log(frm.doc.job_started)
				$(document).find('span[data-label="Send to QC"]').closest('li.user-action').hide();
			}
		},1000)
		
		if(frm.doc.bom_no != undefined && frm.doc.docstatus==0){
			req = frappe.call({
				method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.get_time_cycle",
				args: {
					bom_no:frm.doc.bom_no,
					operation:frm.doc.operation,
					workstation:frm.doc.workstation
				},
				callback: function(res) {	
					req = false;
					datas = res.message
					// console.log(datas)
					$(document).find('input[data-fieldname="ideal_cycle_time_in_secs"]').val(datas.data);
				}
			});
		}
		// bom_no = 
		not_good(frm, cdt, cdn)
		save_production_item(frm,cdt,cdn)
		xxx++;		
			
	},
	// before_submit:function(frm, cdt, cdn){
	// 	console.log(frm.doc)
	// },	
	before_save: function(frm, cdt, cdn) {		
		msgprint("Before save!");
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
	}

});

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
	console.log(data);
	
	filters = {
		"name": ["=",data.work_order]
	}
	frappe.model.with_doc("Work Order", filters, function(){
		// console.log(filters)
		item = frappe.db.get_value("Work Order",filters,['production_item']).done(function(d){							
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
		if(job_card === null || job_card == undefined){
			filters = {
				"work_order": ["=",work_order]
			}
		} else {
			filters = {
				"name": ["=",job_card]
			}
		}
		// console.log(filters)
		console.log(data)
		$.each(data.items || [], function(k,v){
			if(v['t_warehouse']){
				item_code = v['item_code'];
				// if(job_card === null || job_card == undefined){
					frappe.model.with_doc("Job Card", filters, function(){
						// console.log(filters)
						item = frappe.db.get_value("Job Card",filters,['name','workstation','posting_date','shift'], as_dict=false, order_by='creation asc').done(function(data){							
							// console.log(data.message)
							batch_id = data.message.posting_date+'/'+data.message.shift+'/'+data.message.workstation;
							console.log(batch_id)
							frappe.call({
								method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.insert_batch_no",
								args: {
									batch_id:batch_id,
									item:item_code
								},
								callback: function(r) {
									// console.log(v)
									// cur_frm.set_value('items', total_completed_qty)
									frappe.model.set_value(v.doctype, v.name, "batch_no", batch_id)
									// frm.reload_doc();
								}
							});
						});						
					})
				// }
			}
		})

	}
})

var arr = [];
var x =0;
var _bom = [];
var req = false;
var data_table = [];
var datas = [];
var data_active = [];
var count_click = 0;
frappe.ui.form.on('BOM', {
	refresh: function (frm, cdt, cdn) {		
		// console.log(frm.doc)
		var bom_no = frm.doc.name;
		 arr = [];
		 x =0;
		 _bom = [];
		 req = false;
		 data_table = [];
		 data_active = [];
		 datas = [];
		 count_click = 0;
		var tree_table = '<table class="tree table-bom-child">'+
			'<tr class="treegrid-0"><th>Item Code</th><th>BOM No.</th><th>Qty</th><th>UOM</th></tr>';
				
		// if(data_items.length){
			get_bom_tree(bom_no,false)			
		// }
		
		tree_table += '</table>';
		setTimeout(function(){
			$('body').find('[data-fieldname="childs"]').html(tree_table)
		},1000)
	}
})

function get_bom_tree(bom_no,$this){	
	if(bom_no){
		var _parent = $this ? $this.closest('tr').data('bom') : '';
		var _sort = 0;
		if($this){
			data_active[count_click] = bom_no;
			count_click++
		}
		// console.log('_parent : '+_parent)
		if(req == false){
			req = frappe.call({
				method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.get_bom_tree",
				args: {
					bom_no:bom_no
				},
				callback: function(res) {	
					req = false;
					datas = res.message
					if(datas.length){
						$.each(datas, function(k,v){
							if($this){								
								_sort = $this.closest('tr').data('sort')
								data_table[x] = v;
								data_table[x]._sort = _sort+''+x+'_';
								data_table[x].childof = _sort;
							} else {
								data_table[x] = v;
								data_table[x]._sort = x+'_';
								data_table[x].childof = '';
							}
							x++;
						})
						// console.log(data_table)
						setTimeout(function(){
							buildtable(data_table)
						},500)
					}	
				}
			});
		}
	}	
}
function buildtable(data_table){
	var i = 0;
	var _sort = 0;
	var tree_data_table = '<table class="tree table-bom-child">'+
		'<tr class="treegrid-0"><th>Item Code</th><th>BOM No.</th><th>Qty</th><th>UOM</th></tr>';
	var datas = data_table.sort(dynamicSort("_sort"));
	var parentid = 0;
	var datachild = [];
	var _click = 0;
	if(datas.length){				
		$.each(datas, function(k,v){	
			_sort = v._sort
			i++;
			datachild[_sort] = i;
			parentid = v.childof !='' ? 'parent-treegrid-'+datachild[v.childof] : '';
			// console.log('xx '+v.bom_no);
			_click = data_active[v.bom_no];
			if(v.expandable) {
				tree_data_table += '<tr class="treegrid-'+i+' '+parentid+'" data-idx="'+i+'" data-click="'+_click+'" data-sort="'+_sort+'" data-bom="'+v.bom_no+'">'+
					'<td data-bom="'+v.bom_no+'"><div class="left"><a class="grey" href="#Form/Item/'+v.item_code+'" data-doctype="Item" data-name="'+v.item_name+'">'+v.item_code+'<div class="treegrid-small">'+ v.item_name+'</div></a></div></td>'+
					'<td><a class="grey" href="#Form/BOM/'+v.bom_no+'" data-doctype="BOM" data-name="'+v.bom_no+'">'+v.bom_no+'</a></td>'+
					'<td>'+v.stock_qty+'</td>'+
					'<td>'+v.stock_uom+'</td>'+
				'</tr>';
				if(v.bom_no != '' && _click != 1){
					tree_data_table += '<tr class="treegrid-'+parseInt(i+1)+' parent-treegrid-'+i+' tr-loading" data-parent="'+i+'" data-idx="'+parseInt(i+1)+'"><td colspan="4" class="tree-loading">loading...</td></tr>';
				}
				i = i+1;
			} else {
				tree_data_table += '<tr class="treegrid-'+i+' '+parentid+'" data-idx="'+i+'" data-sort="'+_sort+'">'+
					'<td><div class="left"><a class="grey" href="#Form/Item/'+v.item_code+'" data-doctype="Item" data-name="'+v.item_name+'">'+v.item_code+'<div class="treegrid-small">'+ v.item_name+'</div></a></div></td>'+
					'<td><a class="grey" href="#Form/BOM/'+v.bom_no+'" data-doctype="BOM" data-name="'+v.bom_no+'">'+v.bom_no+'</a></td>'+
					'<td>'+v.stock_qty+'</td>'+
					'<td>'+v.stock_uom+'</td>'+
				'</tr>';
			}
			
		})						
	} else {
		// setTimeout(function(){
		// 	_table += '<tr class="no_data"><td colspan="4" class="grid-empty text-center">No Data</td></tr>';
		// },1500)
	}
	setTimeout(function(){
		$(document).find('.table-bom-child').html(tree_data_table)
		$('.tree').treegrid({
			'initialState': 'collapsed',
			// 'saveState': true,
		});

		// console.log(data_active)
		$.each(data_active, function(k,v){
			// console.log(v)
			$('body').find('table.table-bom-child tr[data-bom="'+v+'"]').attr('data-click',1);
			var xid = $('body').find('table.table-bom-child tr[data-bom="'+v+'"]').data('idx');
			$('body').find('table.table-bom-child tr.tr-loading[data-parent="'+xid+'"]').remove()
			$('body').find('table.table-bom-child tr[data-bom="'+v+'"]').find('span').click();

		})
	},1500)
		
}

$(document).ready(function(){	
	$(document).off('click','.treegrid-expander-expanded');
	$(document).on('click','.treegrid-expander-expanded',function(){
		var $this = $(this)
		var bom_no = $this.closest('tr').data('bom');	
		var _click = $this.closest('tr').attr('data-click');
		if(_click == 0 || _click == 'undefined'){
			get_bom_tree(bom_no,$this)
		}		
	})
})
function dynamicSort(property) {
    var sortOrder = 1;

    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a,b) {
        if(sortOrder == -1){
            return b[property].localeCompare(a[property]);
        }else{
            return a[property].localeCompare(b[property]);
        }        
    }
}