var dnd = {
    commandStack:[],
    commands:{},

    enterMode:function(cmds, options){
	var opts = {
	    inheritCommands:true
	};
	$.extend(opts, options);
	
	var newCmds = {};  //new object so we don't blow away input
	if (opts.inheritCommands) {
	    $.extend(newCmds, dnd.commands); //merge in existing set	    
	}
	$.extend(newCmds, cmds); //merge in new
	dnd.commandStack.push(newCmds);
	dnd.commands = newCmds;

    },

    exitMode:function(){
	var stack = dnd.commandStack;
	stack.pop();
	dnd.commands = stack[stack.length - 1];
    },

    cmd:function(thing){	
	if($.isFunction(thing)) return thing;	
	return dnd.commands[thing] || dnd.commands['*'];
    },

    input:function(key){
	if (key !== null) {
	    $('#ir-input').html(key);
	    try{
		dnd.cmd(key)(key);
		$(document).trigger('ir-input', key);
	    } catch (x) {
		console.log('Error:', key, x);
	    }
	}
    },

    monitorIR : function(){
	$.getJSON('ir.json', function(data){
		      dnd.input(data.key);
		      dnd.monitorIR();
		  });
    },

    confirm : function(message, action){
	var confirmDom = $('<div/>').html(message);
	var cleanUp = function(){
	    confirmDom.dialog('close');
	    dnd.exitMode();
	};
	dnd.enterMode({
			  enter:function(key){
			      cleanUp();
			      action(key);
			  },
			  '*':cleanUp
		      }, {inheritCommands:false});
	
	confirmDom.dialog({modal:true});
    },

    get_number : function(message, action){
	
	var confirmDom = $('<div/>').html(message);
	var number = $('<h3/>');
	confirmDom.append(number);
	
	var result = 0;
	var last = "0";
	var add = function(key){
	    last = number.text();
	    result = parseInt(last + key);
	    number.text(result);
	};
	var cleanUp = function(){
	    confirmDom.dialog('close');
	    dnd.exitMode();
	};
	var invertSign = function(){
	    last = number.text();
	    last = result = -1*parseInt(last);
	    number.text(result);	    
	};
	dnd.enterMode({
			  enter:function(key){
			      cleanUp();
			      action(result);
			  },
			  left:function(key){
			      number.text(last);
			  },
			  'select':invertSign,
			  0:add,1:add,2:add,3:add,4:add,5:add,6:add,7:add,8:add,9:add,
			  '*':cleanUp
		      }, {inheritCommands:false});
	
	confirmDom.dialog({modal:true});
    },


    initialize : function(){

	// map keyboard events to IR commands to ease testing
	var keyboardMap = {
	    48:0,
	    49:1,
	    50:2,
	    51:3,
	    52:4,
	    53:5,
	    54:6,
	    55:7,
	    56:8,
	    57:9,
	    13:'enter',
	    38:'up',
	    40:'down',
	    37:'left',
	    39:'right',
	    32:'select', //space
	    109:'mute', //m
	    44:'adjust-left', //<
	    46:'adjust-right', //>
	    97:'add-erase', //a
	    112:'power', //p
	    114:'recall', //r
	    98:'bloody', //b
	    105:'i', //i
	    73:'I'
	};
	$(document).keypress(
	    function(evt) {
	
		var mappedInput = keyboardMap[evt.keyCode] ||
		    keyboardMap[evt.which];
		if(mappedInput !== null)
		    dnd.input(mappedInput);
		else{
		    console.log('unmapped keypress:', evt.keyCode, evt.which);
		}
	    });

	dnd.monitorIR();
	dnd.enterMode({'*':function(key){console.log('unbound key', key);}});    
    }
};

$(dnd.initialize);