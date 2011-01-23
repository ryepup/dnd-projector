var dnd = {
    nextEvent:function(){
	console.log('waiting for event');
	$.ajax({url:"projector.json", dataType:"json",
	       success:dnd.handleEvent});
    },
    handleEvent:function(dndEvent){
	console.log('got event ', dndEvent);
	evtType = dndEvent[0];
	evtData = dndEvent[1];

	if (evtType == "damage"){
	    pli = $('li#p'+evtData.pid);
	    pli.animate({opacity:.25},500)
		.animate({opacity:1},500);
	    $('.damage', pli).text(evtData.damage);
	}else if(evtType == "reset"){
	    dnd.getPlayers();
	}

	dnd.nextEvent();
    },
    getPlayers:function(){
	$.ajax({url:"players.json", dataType:"json", 
		success:dnd.renderPlayers
	       });
    },
    makePlayer:function(player){
	var li = $('<li>').attr('id', 'p'+player.id);
	if (player.bloodiedP) li.addClass('bloody');
	if (player.hostileP) li.addClass('hostile');
	li.append($('<div class="damage">').text(player.damage).addClass('damage'));
	li.append($('<div class="init">').text(player.initiative));
	li.append($('<div class="name">').text(player.name));
	li.append($('<div class="id">').text(player.id));
	li.append($('<div style="clear:both;">'));
	return li;
	
    },
    renderPlayers:function(players){
	$("#combatants").empty();
	$(players).each(function(idx, player){
			    $("#combatants").append(dnd.makePlayer(player));
			    
			    
			});
	$('#combatants li:nth-child(2)').addClass('atbat');
    }
};

$(function(){
      dnd.handleEvent(["reset"]);
});