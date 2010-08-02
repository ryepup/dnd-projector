dnd.standardParty = ["Ryepup", "Ammonia", "Ecthellion", "Tibbar", "Jack"];

jQuery.fn.restoreEvents = function(eventDefs){
    for(var i = 1; i < arguments.length; i++){
	console.log(arguments[i]);
	this.bind(arguments[i], eventDefs[arguments[i]]);	
    }
    return this;
};

dnd.standardCombatEvents = {
    'player-moved.combat':function(evt, index){
	console.log('standard player-moved');
	$('#combatants li.highlighted').removeClass('highlighted');
	$('#combatants li:eq('+index+')').addClass('highlighted');
	dnd.highlightedPlayer = index;
    },
    'down.combat' : function(evt, key){
	var newIndex = (dnd.highlightedPlayer + 1) 
	    % $('#combatants li').length;
	$(dnd.doc).trigger('player-moved.combat', newIndex);
    },
    'up.combat':function(evt, key){
	var newIndex = dnd.highlightedPlayer - 1;
	if(newIndex < 0) newIndex = $('#combatants li').length - 1;
	
	$(dnd.doc).trigger('player-moved.combat', newIndex);
    },
    'select.combat': function(evt, key){
	dnd.selectedPlayer = dnd.highlightedPlayer;
	$('#combatants li.selected').removeClass('selected');
	$('#combatants li:eq('+dnd.highlightedPlayer+')').addClass('selected');
    },
    'mute.combat' : function(evt, key){
	$('#combatants').toggleClass('moving');
	$(dnd.doc).unbind('mute.combat')
	    .unbind('player-moved.combat')
	    .bind(
		{
		'player-moved.combat.moving' : function(evt, newIndex){
		    console.log('moving player');
		    var pl = $('#combatants li.highlighted').detach();
		    if(newIndex == 0){
			$('#combatants').prepend(pl);
		    }else if(newIndex == $('#combatants li').length){
			$('#combatants').append(pl);
		    }else{
			$('#combatants li:eq('+newIndex+')').before(pl);
		    }
		    dnd.highlightedPlayer = newIndex;
		},
		'mute.combat.moving' : function(evt, key){
		    $('#combatants').toggleClass('moving');
		    $(dnd.doc).unbind('.moving')
			.restoreEvents(dnd.standardCombatEvents, 'mute.combat', 'player-moved.combat');
		}
	    });
    }
};

$(function(){
      //load up the standard party
      $.each(dnd.standardParty, function(index, name){
		 $('#combatants').append("<li>" + name + "</li>");
	     });
      $(dnd.doc).bind(dnd.standardCombatEvents)
	  .trigger('player-moved.combat', 0);
  });
