var dnd = {};

dnd.processIR = function(data){
	      $('#ir-input').effect('bounce', {}, 100)
	      .html(data.key);
};

dnd.monitorIR = function(){
	      $.getJSON('ir.json', function(data){
		dnd.processIR(data);
		dnd.monitorIR();
	      })

};


$(dnd.monitorIR);