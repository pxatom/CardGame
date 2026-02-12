function evaluateFlush(suits) {

  var condition = 0;

  var controlVal = suits.splice(0,1).toString();

  $.each(suits, function(idx,nextVal) {

    if (controlVal == nextVal) {
     controlVal = nextVal;
     condition = 8; 
    } else {
     condition = 0;
     return false;     // this return syntax breaks the jquery loop
    }
 
   });
 
   return condition;

}

function evaluateStraight(values) {

  // at this point, no pairs, '.. of a kind' or full house was detected
  // so cards are all different values

  var aceFlag = false;
  var aceIndex;
  var collection1 = [];
  var condition = 0;
  
  // find and pull out ace if present
  
  aceIndex = values.indexOf('ace');

  if (aceIndex >= 0) {
    values.splice(aceIndex,1);
    aceFlag = true;
  }

 
  for (var i=0; i < values.length; i++) {
   
    var weight;

    if (weight = parseInt(values[i])) {
      collection1.push(weight);
    } else {
       switch(values[i]) {
        case "jack":
         weight = 11;
         break;
        case "queen":
         weight = 12;
         break;
        case "king":
          weight = 13;
          break;
        default:
          break 
       }
       collection1.push(weight);
    }
  }

  collection1.sort((a, b) => a - b);

  if (aceFlag) {
   if (collection1[0] == 2) {
    collection1.splice(0,0,1);
   } else if (collection1[collection1.length-1] == 13) {
    collection1.push(14);
   } else {                 // ace does not fit front or rear of card sequence - return zero
    return 0;
   }
  }

  // ace was placed correcty or was not present so contine checking sequence
  var controlVal = parseInt(collection1.splice(0,1));   // peel first comparison val

  $.each(collection1, function(idx,nextVal) {

   if ((controlVal + 1) == nextVal) {
    controlVal = nextVal;
    condition = 7; 
   } else {
    condition = 0;
    return false;     // this return syntax breaks the jquery loop
   }

  });


  return condition;

}

function evaluateDuplicates(values) {

var allMatchSequences = [];
var condition = 0;
var currentMatchSeq = [];
var pointer = 0;
var controlVal = null;
var nextVal = null;

while (controlVal = values.splice(0,1).toString()) {

 currentMatchSeq.push(controlVal);
 pointer = 0;

 while (nextVal = values[pointer]) {

  if (controlVal == nextVal) {
    currentMatchSeq.push(values.splice(pointer,1));
  } else {
    pointer++;
  }

 }

 if (currentMatchSeq.length > 1) {
    allMatchSequences.push(currentMatchSeq);
 }

  currentMatchSeq = [];


}

 if (allMatchSequences.length > 0) {

  var feedBackStr = null;
  var pairs = 0;
  var threeOf = 0;
  var fourOf = 0;
  var fiveOf = 0;

  $.each(allMatchSequences, function (idx, condition) {

   if (condition.length == 2) {
    pairs++;  
   }

   if (condition.length == 3) {
    threeOf++;  
   }

   if (condition.length == 4) {
    fourOf++;  
   }

   if (condition.length == 5) {
    fiveOf++;  
   }

  });

  if ((pairs == 1) && (threeOf == 0)) {
    condition = 1;
  }

  if (pairs == 2) {
    condition = 2;
  }

  if ((pairs == 1) && (threeOf == 1)) {
    condition = 6;
  }

  if ((pairs == 0) && (threeOf == 1)) {
    condition = 3;
  }

  if (fourOf == 1) {
    condition = 4;
  } 

  if (fiveOf == 1) {
    condition = 5;
  } 

 } else {
  condition = 0;

 }

 return condition;

}

function evaluatePlayerHand() {

 var rTag = /^([a-z]+)[_]{1}(.*)$/;

 var cardValues = [];
 var cardSuits = [];
 var pairsOrFullHouse = 0;
 var straight = 0;
 var flush = 0;
 var feedbackMsg = null;
 var scoreObj = null;

 var playerHandCall = 0;

 $.each(currentPlayerHand, function(idx,cardTag) {

    var matches = cardTag.match(rTag);

    cardSuits.push(matches[1]);
    cardValues.push(matches[2]);

 });

  // you have to send  copies as arguments because functions perform slicing

  var currentCardVals1 = Array.from(cardValues);
  var currentCardVals2 = Array.from(cardValues);
  var currentSuitVals = Array.from(cardSuits);

  pairsOrFullHouse = evaluateDuplicates(currentCardVals1);
  straight = evaluateStraight(currentCardVals2);
  flush = evaluateFlush(currentSuitVals);

  if (pairsOrFullHouse > 0) { 
    playerHandCall = pairsOrFullHouse;
  }

  if ((straight > 0) && (flush == 0)) {
    playerHandCall = straight;
  }

  if ((flush > 0)  && (straight == 0)) {
    playerHandCall = flush;
  }

  if ((straight > 0) && (flush > 0)) {
    playerHandCall = 9;
  }

  scoreObj = scores[playerHandCall];

  feedbackMsg = scoreObj.feedbackMsg;

 $("#playerFeedbackMsgSpan").text(feedbackMsg);

 scoreIndex = playerHandCall;

}

function closeOutFinalHand() {

 var tallyAmountSpanText = $("#tallyAmountSpan").text();
 var currentTally = parseInt(tallyAmountSpanText);
 
 var scoreObj = scores[scoreIndex];

 currentTally += scoreObj.score;

 $("#tallyAmountSpan").text(currentTally.toString());

 $("#drawButton").prop("disabled",true);
 $("#dealButton").prop("disabled",false);

}

function drawCards() {

    $.each(deSelectedCards, function(index, cardId) {
      
        var cardImg = document.getElementById(cardId);
    
        var cardObj = { ...deck[0]};
        deck.splice(0, 1);

        var newCardTag = cardObj.tag;
        
        var cardTag = $(cardImg).attr("tag");

        var idx = currentPlayerHand.indexOf(cardTag);

        currentPlayerHand.splice(idx,1);

        currentPlayerHand.push(newCardTag);

        var cardFilePath = '';
        cardFilePath = cardFilePath.concat(frontsRoot);
        cardFilePath = cardFilePath.concat('/');
        cardFilePath = cardFilePath.concat(cardObj.image_file_name);
        $(cardImg).attr("src",cardFilePath);
        $(cardImg).attr("tag",newCardTag);

        $(cardImg).css({"border":"none","padding":"3px"});

    });

    evaluatePlayerHand();

    closeOutFinalHand();

    gameStatus = "new";

    $(".playerHandCardImg").css({"border":"none","padding":"3px"});
    $(".playerCardHoldDiv").css("visibility","hidden");

}

function selectDeselectCard(card) {

 if (gameStatus == 'new') {
   return;
 }

 var cardId = $(card).attr("id");


 // All cards have am initial class of 'discard'

 if ($(card).hasClass("discard")) {  // telling it to 'hold' this card
    $(card).css({"padding":0,"border":"3px solid red"});
    $(card).removeClass("discard");
    $(card).addClass("hold");

    $(card).siblings(".playerCardHoldDiv").css( "visibility", "visible" );

    var idx = deSelectedCards.indexOf(cardId);

    console.log(idx);

    // if card is already in the deSelected collection - get rid of it - negative one if not there
    if (idx >= 0 ) {
     deSelectedCards.splice(idx,1);
    }

 } else {     // telling it to 'discard' the card - this is for when it gets selected then deselected
    $(card).css({"border":"none","padding":"3px"});
    $(card).removeClass("hold");
    $(card).addClass("discard");

    $(card).siblings(".playerCardHoldDiv").css( "visibility", "hidden" );

    deSelectedCards.push(cardId);  // now we push it into the collection to be replaced
    
 }

}

function getShuffledDeck() {

    var unShuffledDeck = [];
    var shuffledDeck = [];

    $.each(cards, function(index, cardObj) {

        unShuffledDeck.push(cardObj);
    });

    while (unShuffledDeck.length > 0) {

     var seed = unShuffledDeck.length;

     var index = Math.floor(Math.random() * seed);

     var randomPick = { ...unShuffledDeck[index]};
     
     unShuffledDeck.splice(index, 1);
     
     shuffledDeck.push(randomPick);


    }

    return shuffledDeck;

}

function dealPlayerHand() {

    resetPlayerHandDiv();

    deck = getShuffledDeck();

    deSelectedCards = [];

    for (var i=0; i < 5; i++) {

        // have to pull the cards off the deck - keep deleting top card

        var cardObj = {...deck[0]};
        deck.splice(0,1);

        var playerCardDiv = document.createElement("div");
        var playerCardImg = document.createElement("img");
        var playerCardHoldDiv = document.createElement("div");

        var cardNum = i + 1;
        var cardId = 'playerCard' + cardNum.toString() + 'Img';

        currentPlayerHand.push(cardObj.tag);
        deSelectedCards.push(cardId);

        $(playerCardDiv).attr("class","playerCardDiv");

        $(playerCardHoldDiv).attr("class","playerCardHoldDiv");

        $(playerCardHoldDiv).text("HOLD");

        $(playerCardImg).attr("id",cardId);
        $(playerCardImg).attr("class","playerHandCardImg");
        $(playerCardImg).addClass("discard");
        $(playerCardImg).attr("tag",cardObj.tag);

        $(playerCardImg).attr("onclick","selectDeselectCard(this)");

        var cardFilePath = '';
        cardFilePath = cardFilePath.concat(frontsRoot);
        cardFilePath = cardFilePath.concat('\\');
        cardFilePath = cardFilePath.concat(cardObj.image_file_name);
        $(playerCardImg).attr("src",cardFilePath);

        $(playerCardDiv).append(playerCardImg).append(playerCardHoldDiv);
        $("#playerHandDiv").append(playerCardDiv);


    }
   
    evaluatePlayerHand();

    gameStatus = "InProgress";

    $("#dealButton").prop("disabled",true);
    $("#drawButton").prop("disabled",false);

}

function resetDealerSection() {

    var dealerSectionDiv = document.createElement("div");
    $(dealerSectionDiv).attr("id","dealerSectionDiv");

    $(dealerSectionDiv).text("Dealer Section");

    $("#allSectionsWrapper").append(dealerSectionDiv);



}

function resetPlayerSection() {

    var playerSectionDiv = document.createElement("div");
    $(playerSectionDiv).attr("id","playerSectionDiv");

    var playerFeedbackDiv = document.createElement("div");
    var playerHandDiv = document.createElement("div");
    var playerControlsDiv = document.createElement("div");

    var playerFeedbackMsgSpan = document.createElement("span");
    $(playerFeedbackMsgSpan).attr("id","playerFeedbackMsgSpan");
    $(playerFeedbackMsgSpan).text("New Game ...");

    var playerFeedbackTallySpan = document.createElement("span");
    $(playerFeedbackTallySpan).attr("id","playerFeedbackTallySpan");

    var tallyLabelSpan = document.createElement("span");
    $(tallyLabelSpan).attr("id","tallyLabelSpan");
    $(tallyLabelSpan).text("Total: $");

    var tallyAmountSpan = document.createElement("span");
    $(tallyAmountSpan).attr("id","tallyAmountSpan");
    $(tallyAmountSpan).text("1");

    $(playerFeedbackTallySpan).append(tallyLabelSpan).append(tallyAmountSpan);

    
    $(playerFeedbackDiv).attr("id","playerFeedbackDiv");
    $(playerHandDiv).attr("id","playerHandDiv");
    $(playerControlsDiv).attr("id","playerControlsDiv");


    $(playerFeedbackDiv).append(playerFeedbackMsgSpan).append(playerFeedbackTallySpan);

    var playerControlButtonsSpan = document.createElement("div");
    $(playerControlButtonsSpan).attr("id","playerControlButtonsSpan");

    var dealButton = document.createElement("button");
    $(dealButton).attr("type","button");
    $(dealButton).attr("id","dealButton");
    $(dealButton).attr("class","playerControlButton");
    $(dealButton).attr("onclick","dealPlayerHand()");
    $(dealButton).prop("disabled",false);
    $(dealButton).text("Deal");

    var drawButton = document.createElement("button");
    $(drawButton).attr("type","button");
    $(drawButton).attr("id","drawButton");
    $(drawButton).attr("class","playerControlButton");
    $(drawButton).attr("onclick","drawCards()");
    $(drawButton).prop("disabled",true);
    $(drawButton).text("Draw");

    $(playerControlButtonsSpan).append(dealButton).append(drawButton);


    $(playerControlsDiv).append(playerControlButtonsSpan);


    $(playerSectionDiv).append(playerFeedbackDiv);
    $(playerSectionDiv).append(playerHandDiv);
    $(playerSectionDiv).append(playerControlsDiv);

    $("#allSectionsWrapper").append(playerSectionDiv);
}

function resetPlayerHandDiv() {

    // add more logic to reset control buttons to dealt hand state

    $("#playerHandDiv").empty();

    currentPlayerHand = [];
    selectedCards = [];


}


function resetAllSections() {
 
    resetDealerSection();

    resetPlayerSection();

}

function cardGameWrapper() {

 resetAllSections();



}