var dnd = {
    commands:{},
    activateCommands:function(newCommands, name){
	if(newCommands._name) 
	    dnd.commandsName = newCommands._name;
	$.extend(dnd.commands, newCommands);
    },
    input:function(key){
	if (key) {
	    $('#ir-input').html(key);
	    try{
		console.log('input:', key);
		dnd.commands[key](key);	    
	    } catch (x) {
		console.log('Error:', key, x);
	    }
	}
    }
};

dnd.monitorIR = function(){
    $.getJSON('ir.json', function(data){
		  dnd.input(data.key);
		  dnd.monitorIR();
	      });
};

dnd.initialize = function(){

    // map keyboard events to IR commands to ease testing
    var keyboardMap = {
	13:'enter',
	38:'up',
	40:'down',
	37:'left',
	39:'right',
	32:'select',
	109:'mute'
    };
    $(document).keypress(
	function(evt)
	{

	    var mappedInput = keyboardMap[evt.keyCode] ||
		keyboardMap[evt.which];
	    if(mappedInput)
		dnd.input(mappedInput);
	    else
		console.log('unmapped keypress:', evt.keyCode, evt.which);
	});

    dnd.monitorIR();
    
};

$(dnd.initialize);