dnd.standardParty = ["Ryepup", "Ammonia", "Ecthellion", "Tibbar", "Jack"];

dnd.commands['down'] = function(){
    var newIndex = (dnd.highlightedPlayer + 1) 
	% $('#combatants li').length;
    if(dnd.moving){
	//move us down
	var pl = $('#combatants li.highlighted').detach();
	if(newIndex == 0){
	    $('#combatants').prepend(pl);
	}else if(newIndex == $('#combatants li').length){
	    $('#combatants').append(pl);
	}else{
	    $('#combatants li:eq('+newIndex+')').before(pl);
	}
	dnd.highlightedPlayer = newIndex;
    }else{
	dnd.highlightPlayer(newIndex);
    }
};

dnd.commands['up'] = function(){
    var newIndex = dnd.highlightedPlayer - 1;
    if(newIndex < 0) newIndex = $('#combatants li').length - 1;

    if(dnd.moving){
	//move us up
	var pl = $('#combatants li.highlighted').detach();
	if(newIndex == 0){
	    $('#combatants').prepend(pl);
	}else if(newIndex == $('#combatants li').length){
	    $('#combatants').append(pl);
	}else{
	    $('#combatants li:eq('+newIndex+')').before(pl);
	}
	dnd.highlightedPlayer = newIndex;
    }else{
	dnd.highlightPlayer(newIndex);	
    }
};

dnd.commands['select'] = function(){
  dnd.selectedPlayer = dnd.highlightedPlayer;
    $('#combatants li.selected').removeClass('selected');
    $('#combatants li:eq('+dnd.highlightedPlayer+')').addClass('selected');
};

dnd.commands['mute'] = function(){
    $('#combatants').toggleClass('moving');
    if(dnd.moving){
	dnd.moving = false;
    }else{
	dnd.moving = true;
    }
};

dnd.highlightPlayer = function(index){
    $('#combatants li.highlighted').removeClass('highlighted');
    $('#combatants li:eq('+index+')').addClass('highlighted');
    dnd.highlightedPlayer = index;
};


$(function(){
      //load up the standard party
      $.each(dnd.standardParty, function(index, name){
		 $('#combatants').append("<li>" + name + "</li>");
	     });

      dnd.highlightPlayer(0);
  });
