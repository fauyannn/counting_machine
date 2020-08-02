var arr = [];
var x =0;
var _bom = [];
var req = false;
var data_table = [];
var datas = [];
var data_active = [];
var count_click = 0;
var bom_no = 0;
frappe.ui.form.on('BOM', {
	refresh: function (frm, cdt, cdn) {		
		// console.log(frm.doc)
		bom_no = frm.doc.name;
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
						console.log(data_table)
						setTimeout(function(){
							buildtable(data_table)
						},500)
					}	
				}
			});
		}
	}	
}

var i =0;
function get_bom_tree_all(bom_no,item_code){
	req = frappe.call({
		method:"counting_machine.counting_machine.doctype.counting_machine.counting_machine.get_bom_tree_all",
		args: {
			bom_no:bom_no,
			item_code:item_code,
			child: false
		},
		callback: function(res) {	
			req = false;
			datas = res.message
			console.log(datas)
			var html = '<ul class="'+bom_no+'">';
			$.each(datas, function(k,v){				
				html += '<li>'+v.parent+'<br>'+v.bom_no+'<br>'+ v.item_code +'</li>';
			});
			html += '</ul>';
			$('div#bom_tree').html(html);
		}
	});
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
		$(document).find('[data-fieldname="childs"]').html(tree_data_table)
		$('.tree').treegrid({
			'initialState': 'collapsed',
			// 'saveState': true,
		});

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
	// $(document).off('change','select.print-preview-select');
	// $(document).on('change','select.print-preview-select',function(){
	// 	var $this = $(this);
	// 	if($this.val() == 'BOM Tree'){
	// 		get_bom_tree_all(bom_no);
	// 		console.log('test : '+$this.val());
	// 	}
	// })

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