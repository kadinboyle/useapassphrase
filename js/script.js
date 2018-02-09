'use strict';

var DEFAULT_NO_WORDS = 5;
var WORDLIST_SIZE = 7776;
var MAX_WORD_TEXT_SIZE = 11; //limiter for adjusting text size in output box
var PASSPHRASE_BASE_TEXT_SIZE = '38';

function generatePassword(numberOfWords) {
  // Cryptographically generated random numbers
  numberOfWords = parseInt(numberOfWords);
  var array = new Uint32Array(numberOfWords);
  var crypto = window.crypto || window.msCrypto;
  crypto.getRandomValues(array);

  // Empty array to be filled with wordlist
  var generatedPasswordArray = [];

  // Grab a random word, push it to the password array
  for (var i = 0; i < array.length; i++) {
      var index = (array[i] % WORDLIST_SIZE);
      generatedPasswordArray.push(wordlist[index]);
  }

  return generatedPasswordArray.join(' ');
}

function convertSecondsToReadable(seconds) {
  var timeString = '';
  var crackabilityColor = 'green';

  // Enumerate all the numbers
  var numMilliseconds = seconds * 1000;
  var numSeconds     = Math.floor(seconds);
  var numMinutes     = Math.floor(numSeconds / 60);
  var numHours       = Math.floor(numSeconds / (60 * 60));
  var numDays        = Math.floor(numSeconds / (60 * 60 * 24));
  var numYears       = Math.floor(numSeconds / (60 * 60 * 24 * 365));
  var numCenturies   = Math.floor(numSeconds / (60 * 60 * 24 * 365 * 100));

  if (numMilliseconds < 1000) {
    timeString = numMilliseconds + ' milliseconds';
  } else if (numSeconds < 60) {
    timeString = numSeconds + ' seconds';
  } else if (numMinutes < 60) {
    timeString = numMinutes + ' minutes';
  } else if (numHours < 24) {
    timeString = numHours + ' hours';
  } else if (numDays < 365) {
    timeString = numDays + ' days';
  } else if (numYears < 100) {
    timeString = numYears + ' years';
  } else {
    timeString = numCenturies + ' centuries';
  }

  return timeString.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function setStyleFromWordNumber(passwordField) {
  var baseSize = PASSPHRASE_BASE_TEXT_SIZE;

  var noWords = 0; //this is just a modifier and is adjusted to limits specified to style the text accordingly
  var individualWords = passwordField.value.split(' ');

  //we need to ignore standalone symbols counting as a whole world because this causes the text to get too small
  for(var i = 0; i < individualWords.length; i++){
    if(!(individualWords[i].length == 1)){
      noWords++;
    }
  }
  
  //For every 5 standalone symbols (those that are surrounded by a space) count as a word
  noWords += Math.floor(countStandaloneSymbols(passwordField) / 5);

  //Still cap at 12 
  if(noWords > MAX_WORD_TEXT_SIZE)
    noWords = MAX_WORD_TEXT_SIZE;
  else if(noWords < 5)
    noWords = 5;

  var newSize = baseSize * (4/noWords);
  passwordField.setAttribute('style', 'font-size: ' + newSize + 'px;');
}

function calculateAndSetCrackTime(numberOfWords) {
  var timeToCrack = zxcvbn(passwordField.value);
  var readableCrackTime = convertSecondsToReadable(timeToCrack.crack_time);
  document.querySelector('.crack-time').innerHTML = readableCrackTime;

  setStyleFromWordNumber(passwordField);

}


var selectField = document.getElementById('passphrase_select');
var passwordField = document.getElementById('passphrase');
var button = document.querySelector('.btn-generate');
var appendSymbolButton = document.querySelector('.btn-addsymbol');
var substituteSymbolButton = document.querySelector('.btn-subsymbol');

//Appending symbols can cause the field to recongize them as a whole world and make text too small in the setStyle function
//Example 'testing motorbike @ phrase ! three' <- contains two standalone symbols
function countStandaloneSymbols(passwordField){
  var noStandaloneSymbols = 0;
  var split = passwordField.value.split(' ');

  for(var i = 0; i < split.length; i++){
    if(split[i].length == 1){
      noStandaloneSymbols++;
    }
  }

  return noStandaloneSymbols;
}

//Calculates the number of 'words' currently sitting in the passphrase field (inclusive of single char standalone symbols)
function calculateNumWords(){
  return passwordField.value.split(' ').length;
}

// Listen for a button click
button.addEventListener('click', function() {
  var numberOfWords = selectField.options[selectField.selectedIndex].value;
  passwordField.value = generatePassword(numberOfWords);
  calculateAndSetCrackTime(numberOfWords);
});


function modifyPassphraseWithSymbol(appendOnly){
  var noWords = parseInt(calculateNumWords());
  var crypto = window.crypto || window.msCrypto;
  var array = new Uint32Array(1);

  var newPassphrase;

  //split existing password into array so we can pick a random word to replace a char in if we are doing not appendOnly
  var passwordFieldSplit = passwordField.value.split(' ');

  //pick random symbol from list
  crypto.getRandomValues(array);
  var randomSymbol = symbolList[(array[0] % symbolList.length)];

  if(!appendOnly){
    
    //first select random word in passphrase that we will swap out a char for a random symbol
    crypto.getRandomValues(array);
    var indexOfTargetWord = (array[0] % noWords);
  
    //select chose char to replace in selected word
    crypto.getRandomValues(array);
    var charIndexToReplace = (array[0] % passwordFieldSplit[indexOfTargetWord].length);
  
    //replace the word with a new word that has a random symbol substituted in
    var word = passwordFieldSplit[indexOfTargetWord];
    var newWord = word.substr(0, charIndexToReplace) + randomSymbol + word.substr(charIndexToReplace + 1);

    passwordFieldSplit[indexOfTargetWord] = newWord;
    newPassphrase = passwordFieldSplit.join(" ");
  } else {
    newPassphrase = passwordField.value + ' ' + randomSymbol;
  }

  passwordField.value = newPassphrase;
}

// Listen for add random symbol button click
substituteSymbolButton.addEventListener('click', function() {
  modifyPassphraseWithSymbol(false);
  calculateAndSetCrackTime();
});

// Listen for add random symbol button click
appendSymbolButton.addEventListener('click', function() {
  modifyPassphraseWithSymbol(true);
  calculateAndSetCrackTime();
});

// Listen for password value change
passwordField.addEventListener('input', function (evt) {
  calculateAndSetCrackTime();
});

// Initially run it upon load
passwordField.setAttribute('value', generatePassword(DEFAULT_NO_WORDS));
calculateAndSetCrackTime();
