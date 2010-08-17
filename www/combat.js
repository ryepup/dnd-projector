dnd.standardParty = ["Ryepup", "Ammonia", "Ecthellion", "Tibbar", "Jack"];

dnd.combat = {
    monsterCount:1,
    addPlayer:function(name){
	$('#combatants').append($("<li/>").html(name).attr('id', name));
    }
};

dnd.combat.standardCommands = {
    _name : "combat",
    focusMoved:function(index){
	$('#combatants li.highlighted').removeClass('highlighted');
	$('#combatants li:eq('+index+')').addClass('highlighted');
	dnd.highlightedPlayer = index;
	$('#main-body').scrollTo('.highlighted', {offset:{top:-50}});	
    },
    down:function(key, focusMovedFn){
	var newIndex = (dnd.highlightedPlayer + 1) 
	    % $('#combatants li').length;
	dnd.cmd(focusMovedFn || 'focusMoved')(newIndex);
    },
    up:function(key, focusMovedFn){
	var newIndex = dnd.highlightedPlayer - 1;
	if(newIndex < 0) newIndex = $('#combatants li').length - 1;
	dnd.cmd(focusMovedFn || 'focusMoved')(newIndex);
    },
    select:function(key){
	$('#combatants li.selected').removeClass('selected');

	if(dnd.selectedPlayer == dnd.highlightedPlayer){
	    dnd.selectedPlayer = null;
	}else{
	    dnd.selectedPlayer = dnd.highlightedPlayer;
	    $('#combatants li:eq('+dnd.highlightedPlayer+')')
		.addClass('selected');
	}
    },
    mute:function(key){
	$('#combatants').toggleClass('moving');
	if(dnd.commandsName == dnd.combat.movingCommands._name){
	    dnd.activateCommands(dnd.combat.standardCommands);
	}else{
	    dnd.activateCommands(dnd.combat.movingCommands);
	    
	}
    },
    'adjust-left':function(key){
	dnd.cmd('up')(key, dnd.combat.movingCommands.focusMoved);
    },
    'adjust-right':function(key){
	dnd.cmd('down')(key, dnd.combat.movingCommands.focusMoved);
    },
    'add-erase':function(key){
	// if someone is selected and highlighted, prompt for their deletion
	if(dnd.selectedPlayer == dnd.highlightedPlayer){
	    var enterfn = dnd.cmd('enter');
	    dnd.commands['enter'] = function(key){
		//remove the actual player
		$('#combatants li:eq('+dnd.highlightedPlayer+')').detach();
		dnd.selectedPlayer=null;
		dnd.cmd('up')('up');
	    };
	    var confirmDom = $('<div/>').html('Press enter to delete this player.');
	    // hack alert: the event fires after this function is called, so we want to
	    // delay hooking the event for a little bit so the current
	    // run doesn't dismiss the dialog
	    setTimeout(function(){
			   $(document).bind('ir-input.confirm', function(){
						confirmDom.dialog('close');
						dnd.commands['enter'] = enterfn;
						$(document).unbind('ir-input.confirm');
					    });
			   
		       }, 100);
	    confirmDom.dialog({modal:true});
	    
	}else{
	    // otherwise, add a new player
	    var name = "monster"+dnd.combat.monsterCount;
	    dnd.combat.monsterCount += 1;
	    dnd.combat.addPlayer(name);
	    dnd.cmd('focusMoved')($('#'+name).index());
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
	$('#main-body').scrollTo(pl, {offset:{top:-50}});
	dnd.highlightedPlayer = index;
    }
};

$(function(){

      dnd.activateCommands(dnd.combat.standardCommands);
      //load up the standard party
      $.each(dnd.standardParty, function(index, name){
		 dnd.combat.addPlayer(name);
	     });
      dnd.commands.focusMoved(0);
  });
