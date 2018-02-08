'use strict';

var DEFAULT_NO_WORDS = 5;
var symbolList = ['!', '&', '"', '[', '~', '|', '\'', '*', '%', '#', '`', '<', '-', '$', ',', '?', ';', '(', '+', '}', ':', '^', '=', ')', '{', '>', ']', '_', '.', '@', '\\'];

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
      var index = (array[i] % 7776); //5852 - 5837 = 15
      generatedPasswordArray.push(wordlist[index]);
  }

  return generatedPasswordArray.join(' ');
}

function setStyleFromWordNumber(passwordField, numberOfWords) {
  var baseSize = '38';
  var newSize = baseSize * (4/numberOfWords);
  passwordField.setAttribute('style', 'font-size: ' + newSize + 'px;');
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

function calculateAndSetCrackTime(numberOfWords) {
  var timeToCrack = zxcvbn(passwordField.value);
  var readableCrackTime = convertSecondsToReadable(timeToCrack.crack_time);
  document.querySelector('.crack-time').innerHTML = readableCrackTime;
  if(numberOfWords)
    setStyleFromWordNumber(passwordField, numberOfWords);
  else
    setStyleFromWordNumber(passwordField, calculateNumWords()); //If not using clicked generation, user must have entered manually or added symbol

}

var selectField = document.getElementById('passphrase_select');
var passwordField = document.getElementById('passphrase');
var button = document.querySelector('.btn-generate');
var appendSymbolButton = document.querySelector('.btn-addsymbol');
var substituteSymbolButton = document.querySelector('.btn-subsymbol');

function calculateNumWords(){
  var noWords = passwordField.value.split(' ').length;
  if(noWords >= 16) //and check char length?
    return 16;
  return noWords >= 5 ? noWords : 5; //Don't get smaller than 5 words or else font becomes too large
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

//setStyleFromWordNumber(passwordField, DEFAULT_NO_WORDS);