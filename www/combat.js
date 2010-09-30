dnd.standardParty = ["Ryepup", "Ammonia", "Ecthellion", "Tibbar", "Jack"];
dnd.formatTime = function(sec){
    seconds = sec % 60;
    mins = Math.floor((sec % 3600) / 60);
    hours = Math.floor(sec/3600);

    if (seconds < 10) seconds = '0'+seconds;
    if (mins < 10) mins = '0'+mins;

    if(hours > 0){
	return hours + ":" + mins + 'm';
    }else{
	return mins + ':' + seconds + 's';
    }
};

dnd.combat = {
    monsterCount:1,
    addPlayer:function(name, hostile){
	var dom = $("<li/>")
	    .data('playerData', {name:name, damage:0, initiative:0})
	    .attr('id', name)
	    .append($('<span class="player-name">').html(name))
	    .append($('<span class="init">').html('0'));
	    
	if (hostile){
	    dom.addClass('hostile');
	}
	var dmg = $('<span class="damage"/>').text("0");
	dom.append(dmg);
	dom.append('<div style="clear:both;"/>');
	$('#combatants').append(dom);
    },
    round:function(num){
	if(arguments.length == 0){
	    return dnd.combat._round;
	}
	dnd.combat._round = num;
	$('#round').html(num);
	$('#game-time').html(dnd.formatTime(num*6));
	return num;
    }
};

dnd.combat.activeCombatCommands = {
    bloody:function(key){
	var dom = $('#combatants li.highlighted');
	dom.toggleClass('bloody');
    },
    mute:function(key){
	//Hit mute to say that player's turn is done, selected the next
	//player
	$('#combatants li.active').removeClass('active');
	dnd.cmd('focusMoved')(dnd.activePlayer);
	dnd.cmd('down')(key);
	dnd.cmd('select')(key, true);
	var dom = $('#combatants li.selected');
	if(dom.index() == 0){
	    dnd.combat.round(dnd.combat.round()+1);
	}
    },
    power:function(key){
	//confirmation dialog, end combat, show stats screen
    },
    recall:function(key){
	var dom = $('#combatants li.highlighted');
	var player = dom.data('playerData');
	dnd.get_number('How much damage?', function(dmg){
			   player.damage += dmg;
			   dom.data('playerData', player);
			   $('.damage', dom).text(player.damage);
			   dom.animate({backgroundColor:'#ff7777'}, 100);
			   dom.animate({backgroundColor:'#ffffff'}, 3000);
			   
		       });
    }
};

dnd.combat.standardCommands = {
    focusMoved:function(index){
	$('#combatants li.highlighted').removeClass('highlighted');
	$('#combatants li:eq('+index+')').addClass('highlighted');
	dnd.highlightedPlayer = index;
	$('#cmb').scrollTo('.highlighted', {offset:{top:-20}});	
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
    select:function(key, makeActive){
	$('#combatants li.selected').removeClass('selected');

	if(dnd.selectedPlayer == dnd.highlightedPlayer){
	    dnd.selectedPlayer = null;
	}else{
	    dnd.selectedPlayer = dnd.highlightedPlayer;
	    if (makeActive){
		dnd.activePlayer = dnd.selectedPlayer;
		$('#combatants li.highlighted').addClass('active');
	    }
	    $('#combatants li.highlighted').addClass('selected');
	}
    },
    power:function(key){
	//start round/real timers
	dnd.cmd('focusMoved')(0);
	dnd.cmd('select')(key, true);
	dnd.combat.startTime = new Date();
	dnd.combat.round(1);
	var updateTime = function(){
	    var secs = Math.floor((new Date() - dnd.combat.startTime)/1000);
	    $('#real-time').html(dnd.formatTime(secs));
	    return secs;
	};
	    
	dnd.combat.realTimer = setInterval(
	    function(){
		var secs = updateTime();
		if (secs > 3600){
		    clearInterval(dnd.combat.realTimer);
		    dnd.combat.realTimer = setInterval(updateTime, 60000);
		}
	    },1000);

	dnd.enterMode(dnd.combat.activeCombatCommands);
	$('#intro').slideUp(function(){$('#combat-summary').slideDown();});
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
	    dnd.confirm('Press enter to delete this player', function(key){
			    $('#combatants .selected').detach();
			    dnd.selectedPlayer=null;
			    dnd.cmd('up')(key); 
			});
	}else{
	    // otherwise, add a new player
	    var name = prompt('monster');//"monster"+dnd.combat.monsterCount;
	    dnd.combat.monsterCount += 1;
	    dnd.combat.addPlayer(name, true);
	    dnd.cmd('focusMoved')($('#'+name).index());
	}
    },
    'i':function(key){
	var init = parseFloat(prompt('Initiative for this guy?'));
	var dom = $('#combatants li.highlighted');
	var player = dom.data('playerData');
	player.initiative = init;
	dom.data('playerData', player);
	$('.init', dom).html(init);
    },
    'I':function(key){
	console.log('sorting');
	var players = $('#combatants li');
	var initiatives = [];
	var doms = [];
	players.each(function(idx, item){
			 var dom = $(item);
			 initiatives.push(dom.data('playerData').initiative);
			 dom.detach();
			 doms.push(dom);
		     });
	initiatives.sort().reverse();
	console.log(initiatives);

	for(var i=0; i < initiatives.length; i++){
	    var init = initiatives[i];
	    for(var j=0; j<doms.length; j++){
		var dom = doms[j];
		var pi = dom.data('playerData').initiative;
		if (init == pi){
		    $('#combatants').append(dom);
		}
	    }
	}
	
	
    }
};

dnd.combat.movingCommands = {
    focusMoved:function(index){
	var pl = $('#combatants li.highlighted').detach();
	if(index == 0){
	    $('#combatants').prepend(pl);
	}else if(index == $('#combatants li').length){
	    $('#combatants').append(pl);
	}else{
	    $('#combatants li:eq('+index+')').before(pl);
	}
	$('#cmb').scrollTo(pl, {offset:{top:-20}});
	dnd.highlightedPlayer = index;
    }
};

$(function(){

      dnd.enterMode(dnd.combat.standardCommands);
      //load up the standard party
      $.each(dnd.standardParty, function(index, name){
		 dnd.combat.addPlayer(name);
	     });
      dnd.commands.focusMoved(0);
  });
