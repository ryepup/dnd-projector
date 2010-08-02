var dnd = {};

dnd.monitorIR = function(){
    $.getJSON('ir.json', function(data){
		  try{
		      console.log('IR:', data);
		      $(dnd.doc).trigger('ir-input', data.key)
			  .trigger(data.key);

		  } catch (x) {
		      console.log('Error:', data, x);
		  }
		  dnd.monitorIR();
	      });
};

dnd.initialize = function(){
    dnd.doc = document;

    $(dnd.doc).bind('ir-input', function(evt, key){
		    $('#ir-input').html(key);
		});

    dnd.monitorIR();
    
};

$(dnd.initialize);