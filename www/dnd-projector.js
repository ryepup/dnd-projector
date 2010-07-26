var dnd = {
    commands:{}
};

dnd.processIR = function(data){
    $('#ir-input').effect('bounce', {}, 100).html(data.key);
    
    try{
	dnd.commands[data.key]();	
    } catch (x) {
	console.log('Bad command for', data.key, x);
    }
};

dnd.monitorIR = function(){
    $.getJSON('ir.json', function(data){
		  dnd.processIR(data);
		  dnd.monitorIR();
	      });
};


$(dnd.monitorIR);