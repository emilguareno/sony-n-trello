/*
 * Copyright 2016 Sony Corporation
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions, and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

/*
COMMANDS EXAMPLES
- move card buy bus ticket to list in progress
- list all boards
- list cards to do
- set board to errands
*/

var speechText, boards, command, lists;
var keyToken = 'key='+ CONFIG.appKey +'&token=' + CONFIG.appToken;

function arrayToString(arr, prop) {
    var str = '';
    for (var i = 0; i < arr.length; i++) {
        str += arr[i][prop] + ', ';
    }
    return str;
}

function getItemFromStorage(key){
    var Storage = new da.Storage();
    return JSON.parse(Storage.getItem(key));
}

function getBoardIdByName(name){
    return boards.find(function(board){
        return board.name.toLowerCase() === name.toLowerCase();
    });
}

function setBoard() {
    var boardName = command.split('set board to ')[1];
    var boardId = getBoardIdByName(boardName).id;
    var Storage = new da.Storage();
    Storage.setItem('board', JSON.stringify({name: boardName, id: boardId}));
}

function startSegment() {
    da.getSegmentConfig({
        onsuccess: function(settingsData) {
            da.startSegment(null, null);
        }
    })
}

function getAllBoards() {
    var deferred = jQuery.Deferred();
    $.ajax({
        url: 'https://api.trello.com/1/member/me/boards?'+ keyToken,
        xhr: function() { return da.getXhr(); },
        success: function(data) {
            boards = data;
            deferred.resolve();
        },
        error: function(jqXHR, textStatus, errorThrown) {

        }
    })
    return deferred.promise();
}

function speakAllBoards() {
    var synthesis = da.SpeechSynthesis.getInstance();
    var boardStr = arrayToString(boards, 'name');
    // API_LEVEL = 2 or later;
    synthesis.speak(boardStr, {
        onstart: function() {
            console.log('[SpeechToText] speak start');
        },
        onend: function() {
            console.log('[SpeechToText] speak onend');
            da.stopSegment();
        },
        onerror: function(error) {
            console.log('[SpeechToText] speak cancel: ' + error.message);
            da.stopSegment();
        }
    });
}

function confirmSetBoard(){
    var synthesis = da.SpeechSynthesis.getInstance();
    var Storage = new da.Storage();
    var currentBoard = getItemFromStorage('board');
    synthesis.speak(currentBoard.name + ' board has been set', {
        onstart: function() {
            console.log('[SpeechToText] speak start');
        },
        onend: function() {
            console.log('[SpeechToText] speak onend');
            da.stopSegment();
        },
        onerror: function(error) {
            console.log('[SpeechToText] speak cancel: ' + error.message);
            da.stopSegment();
        }
    });
}

function getListsFromBoard(){
    var currentBoard = getItemFromStorage('board');
    var deferred = jQuery.Deferred();
    $.ajax({
        url: 'https://api.trello.com/1/boards/'+ currentBoard.id +'/lists?cards=open&card_fields=name&fields=name&'+ keyToken,
        xhr: function() { return da.getXhr(); },
        success: function(data) {
            lists = data;
            deferred.resolve();
        },
        error: function(jqXHR, textStatus, errorThrown) {

        }
    })
    return deferred.promise();
}

function getListsByName(name){
    return lists.find(function(list){
        return list.name.toLowerCase() === name.toLowerCase();
    });
}

function speakCardsInList(){
    var listName = command.split('list cards ')[1];
    var cards = arrayToString(getListsByName(listName).cards, 'name');
    var synthesis = da.SpeechSynthesis.getInstance();
    // API_LEVEL = 2 or later;
    synthesis.speak(cards, {
        onstart: function() {
            console.log('[SpeechToText] speak start');
        },
        onend: function() {
            console.log('[SpeechToText] speak onend');
            da.stopSegment();
        },
        onerror: function(error) {
            console.log('[SpeechToText] speak cancel: ' + error.message);
            da.stopSegment();
        }
    });
}

function confirmCardMoved(cardName, listName){
    var synthesis = da.SpeechSynthesis.getInstance();
    // API_LEVEL = 2 or later;
    synthesis.speak('card ' + cardName + ' has been moved to ' + listName, {
        onstart: function() {
            console.log('[SpeechToText] speak start');
        },
        onend: function() {
            console.log('[SpeechToText] speak onend');
            da.stopSegment();
        },
        onerror: function(error) {
            console.log('[SpeechToText] speak cancel: ' + error.message);
            da.stopSegment();
        }
    });
}

function confirmCommentAdded(comment, cardName){
    var synthesis = da.SpeechSynthesis.getInstance();
    // API_LEVEL = 2 or later;
    synthesis.speak('comment ' + comment + ' has been added to ' + cardName, {
        onstart: function() {
            console.log('[SpeechToText] speak start');
        },
        onend: function() {
            console.log('[SpeechToText] speak onend');
            da.stopSegment();
        },
        onerror: function(error) {
            console.log('[SpeechToText] speak cancel: ' + error.message);
            da.stopSegment();
        }
    });
}

function getCardByName(name){
    for(var i = 0; i < lists.length; i++){
        for(var j = 0; j < lists[i].cards.length; j++){
            if(lists[i].cards[j].name.toLowerCase() === name.toLowerCase()){
                return lists[i].cards[j];
            }
        }
    }
}

function moveCard(){
    var cardList = command.split('move card ')[1].split(' to list ');
    var cardName = cardList[0];
    var listName = cardList[1];
    var listId = getListsByName(listName).id;
    var cardId = getCardByName(cardName).id;
    var deferred = jQuery.Deferred();
    $.ajax({
        url: 'https://api.trello.com/1/cards/'+ cardId +'?idList='+ listId +'&'+ keyToken,
        xhr: function() { return da.getXhr(); },
        method: 'PUT',
        success: function(data) {
            deferred.resolve(cardName, listName);
        },
        error: function(jqXHR, textStatus, errorThrown) {

        }
    })
    return deferred.promise();
}


function addCommentToCard() {
    var commentCommand = command.split('add comment ')[1].split(' to card ');
    var comment = commentCommand[0];
    var cardName = commentCommand[1];
    var cardId = getCardByName(cardName).id;
    var listName = cardList[1];
    var deferred = jQuery.Deferred();
    
    $.ajax({
        url: 'https://api.trello.com/1/cards/'+ cardId +'/actions/comments?text='+comment+ '&' + keyToken,
        xhr: function() { return da.getXhr(); },
        method: 'POST',
        success: function(data) {
            deferred.resolve(comment, cardName);
        },
        error: function(jqXHR, textStatus, errorThrown) {

        }
    })

}
/**
 * The callback to prepare a segment for play.
 * @param  {string} trigger The trigger type of a segment.
 * @param  {object} args    The input arguments.
 */
da.segment.onpreprocess = function(trigger, args) {
    console.log('[SpeechToText] onpreprocess', { trigger: trigger, args: args });
    command = JSON.parse(args.recognitionSetString).SemanticAnalysisResults[0].SpeechRecogResult;
    switch (true) {
        case command === 'list all boards':
            $.when(getAllBoards()).then(function() {
                startSegment();
            });
            break;
        case command.indexOf('set board to') !== -1:
            $.when(getAllBoards()).then(function() {
                setBoard();
                startSegment();
            });
            break;
        case command.indexOf('list cards') !== -1:
            $.when(getListsFromBoard()).then(function() {
                startSegment();
            });
            break;
        case command.indexOf('move card') !== -1:
            $.when(getListsFromBoard()).then(function() {
                startSegment();
            });
            break;
    }
};

/**
 * The callback to start a segment.
 * @param  {string} trigger The trigger type of a segment.
 * @param  {object} args    The input arguments.
 */

da.segment.onstart = function(trigger, args) {
    console.log('[SpeechToText] onstart', { trigger: trigger, args: args });
    var synthesis = da.SpeechSynthesis.getInstance();

    if (da.getApiLevel === undefined) {
        // API_LEVEL = 1;
        synthesis.speak('This device software is not available for speech to text function.', {
            onstart: function() {
                console.log('[SpeechToText] speak start');
            },
            onend: function() {
                da.stopSegment();
            },
            onerror: function(error) {
                da.stopSegment();
            }
        });
    } else {
        switch (true) {
        case command === 'list all boards':
            speakAllBoards();
            break;
        case command.indexOf('set board to') !== -1:
            setBoard();
            confirmSetBoard();
            break;
        case command.indexOf('list cards') !== -1:
            speakCardsInList();
            break;
        case command.indexOf('move card') !== -1:
            $.when(moveCard()).then(function(cardName, listName){
              confirmCardMoved(cardName, listName);  
            });        
            break;
        case command.indexOf('add comment') !== -1:
            $.when(addCommentToCard()).then(function(comment, cardName){
                confirmCommentAdded(comment, cardName);
            });
            break;        
        }
    }
};