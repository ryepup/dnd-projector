dnd.standardParty = ["Ryepup", "Ammonia", "Ecthellion", "Tibbar", "Jack"];

jQuery.fn.restoreEvents = function(eventDefs){
    for(var i = 1; i < arguments.length; i++){
	console.log(arguments[i]);
	this.bind(arguments[i], eventDefs[arguments[i]]);	
    }
    return this;
};

dnd.combat = {};

dnd.combat.standardCommands = {
    _name : "combat",
    focusMoved:function(index){
	$('#combatants li.highlighted').removeClass('highlighted');
	$('#combatants li:eq('+index+')').addClass('highlighted');
	dnd.highlightedPlayer = index;
    },
    down:function(){
	var newIndex = (dnd.highlightedPlayer + 1) 
	    % $('#combatants li').length;
	dnd.commands.focusMoved(newIndex);
    },
    up:function(){
	var newIndex = dnd.highlightedPlayer - 1;
	if(newIndex < 0) newIndex = $('#combatants li').length - 1;
	dnd.commands.focusMoved(newIndex);
    },
    select:function(){
	dnd.selectedPlayer = dnd.highlightedPlayer;
	$('#combatants li.selected').removeClass('selected');
	$('#combatants li:eq('+dnd.highlightedPlayer+')')
	    .addClass('selected');
    },
    mute:function(){
	$('#combatants').toggleClass('moving');
	if(dnd.commandsName == dnd.combat.movingCommands._name){
	    dnd.activateCommands(dnd.combat.standardCommands);
	}else{
	    dnd.activateCommands(dnd.combat.movingCommands);
	    
	}
    }
};

dnd.combat.movingCommands = {
    _name : "moving",
    focusMoved:function(index){
	var pl = $('#combatants li.highlighted').detach();
	if(index == 0){
	    $('#combatants').prepend(pl);
	}else if(index == $('#combatants li').length){
	    $('#combatants').append(pl);
	}else{
	    $('#combatants li:eq('+index+')').before(pl);
	}
	dnd.highlightedPlayer = index;
    }
};

$(function(){
      //load up the standard party
      $.each(dnd.standardParty, function(index, name){
		 $('#combatants').append($("<li/>").html(name));
	     });
      dnd.activateCommands(dnd.combat.standardCommands);
      dnd.commands.focusMoved(0);
  });
