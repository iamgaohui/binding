$.fn.binding = function(dfg){
	this.dfg = $.extend({			
		data:{}
	},dfg);
	var _binding = function(_self){			
		this.ele = $(_self[0]);
		this.self = _self;
		this.data = _self.dfg.data;
		this.init();
	};
	/*插件初始化*/
	_binding.prototype.init = function(){		
		this.resolveHtml();
		this.resolveEle();
		this.bindTextAndEvent();
		this.modelInit();		
	}
	/*解析HTML模版*/
	_binding.prototype.resolveHtml = function(){
		let html = $(this.ele).html(),
			reg = new RegExp('{{(.*?)}}','gim'),
			m = html.match(reg);
		m.forEach(function(item,i){
			html = html.replace(item,'<span b-text="'+item.replace('{{','').replace('}}','')+'"></span>');
		})
		$(this.ele).html(html);
	}
	/*处理绑定的元素*/
	_binding.prototype.resolveEle = function(){
		let map = {},
			that = this,
			eles = Array.from($(this.ele).find('[b-text],[b-html],[b-model]'));
		eles.forEach(function(item,i){
			let key = $(item).attr('b-text')||$(item).attr('b-html')||$(item).attr('b-model');
			if(!map[key]){
				map[key] = {
					value:that['data'][key],
					ele:[item]
				}
			}else{
				map[key].ele.push(item);
			}
		})
		this.map = map;
	}
	/*text文本类型的绑定*/
	_binding.prototype.bindTextAndEvent = function(){
		for(let i in this.map){
			this.set(i,this.map[i]);
		}
	}
	/*model的双向绑定*/
	_binding.prototype.modelInit = function(){
		let eles = Array.from($(this.ele).find('[b-model]')),
			that = this;
		eles.forEach(function(item,i){
			if($(item).attr('type')=='radio'||$(item).attr('type')=='checkbox'){
				$(item).on('change',function(){
					that.changeEvent($(item),$(item).attr('b-model'))
				})
			}else{
				$(item).on('keyup',function(){
					that.keyupEvent($(item),$(item).attr('b-model'))
				})
			}
		})
	}
	/*input的keyup事件*/
	_binding.prototype.keyupEvent=function(input,key){
		this[key]=input.val()
	}
	/*input radio checkbox的change事件*/
	_binding.prototype.changeEvent=function(input,key){
		this[key]=input.prop('checked');
	}
	/*利用defineProperty这个属性设计set和get*/
	_binding.prototype.set = function(key,val){
		let that = this;
		Object.defineProperty(this, key, {
		    get:function(){
		    	return val.value
		    },
		    set:function(newValue){
		    	val.value = newValue;
		    	val.ele.forEach(function(item,i){
		    		that.setText(item,val.value)
		    	})		    	
		    }
		})
		this[key] = val.value;
	}
	/*改变页面上的值*/
	_binding.prototype.setText = function(ele,value){
		ele = $(ele);
		if(ele[0].tagName=='INPUT'){
			if(ele.attr('type')=='radio'||ele.attr('type')=='checkbox'){
				ele.prop('checked',value);
			}else{
				ele.val(value)
			}			
		}else{
			ele[ele.attr('b-text')?'text':'html'](value);
		}		
		
	}
	return new _binding(this);		
}