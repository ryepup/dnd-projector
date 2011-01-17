var dnd = {
    getPlayers:function(){
	$.ajax({url:"players.json", dataType:"json", 
		success:dnd.renderPlayers
	       });
	setTimeout(dnd.getPlayers, 1000);
    },
    makePlayer:function(player){
	var li = $('<li>');
	if (player.bloodiedP) li.addClass('bloody');
	if (player.hostileP) li.addClass('hostile');
	li.append($('<div class="damage">').text(player.damage).addClass('damage'));
	li.append($('<div class="init">').text(player.initiative));
	li.append($('<div class="name">').text(player.name));
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

$(dnd.getPlayers);