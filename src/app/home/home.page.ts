import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ItemReorderEventDetail } from '@ionic/angular';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, HttpClientModule],
})

export class HomePage { }

export function getWords(): string[][]
{                                                                                                                                   //10                                                                                                                                //20                                                                                                                                      //30
  return [["House",       "Cat",      "Mountain",   "Bicycle",  "Tree",       "Book",     "Piano",        "Box",        "Shell",    "Mirror",     "Frame",      "Scope",      "Light",    "Teeth",      "Sword",    "Fire",      "Carriage",  "Hare",       "Water",    "Cloud",    "Skull",      "Electricity",    "Egg",      "Umbrella",     "Diamond",    "Horse",    "Cotton",     "Cartoon",    "Sea",      "Crown"],
          ["Haus",        "Katze",    "Berg",       "Fahrrad",  "Baum",       "Buch",     "Klavier",      "Kasten",     "Hülse",    "Spiegel",    "Rahmen",     "Umfang",     "Licht",    "Zähne",      "Schwert",  "Brand",     "Wagen",     "Hase",       "Wasser",   "Wolke",    "Schädel",    "Elektrizität",   "Ei",       "Regenschirm",  "Diamant",    "Pferd",    "Baumwolle",  "Karikatur",  "Meer",     "Krone"],
          ["Neutral",     "Feminine", "Masculine",  "Neutral",  "Masculine",  "Neutral",  "Neutral",      "Masculine",  "Feminine", "Masculine",  "Masculine",  "Masculine",  "Neutral",  "Masculine",  "Neutral",  "Masculine", "Masculine", "Masculine",  "Neutral",  "Feminine", "Masculine",  "Feminine",       "Neutral",  "Masculine",    "Masculine",  "Neutral",  "Feminine",   "Feminine",   "Neutral",  "Feminine"],
          ["Structure",   "Animal",   "Land",       "Vehicle",  "Natural",    "Object",   "Instrument",   "Object",     "Object",   "Object",     "Object",     "Object",     "Natural",  "Body",       "Object",   "Natural",   "Vehicle",   "Animal",     "Natural",  "Natural",  "Body",       "Natural",        "Natural",  "Object",       "Natural",    "Animal",   "Natural",    "Medium",     "Natural",  "Object"]]
}

export function generateExcercise(col1: number, col2: number, hasAudio: boolean, questionData: string, category: string): void
{
  document.getElementById("startBtn")!.hidden = true;
  document.getElementById("instructionsTitle")!.hidden = true;
  document.getElementById("instructions")!.hidden = true;
  document.getElementById("lengthInput")!.hidden = true;

  document.getElementById("promptTable")!.hidden = false;
  document.getElementById("answerTable")!.hidden = false;

  document.getElementById("submitBtn")!.hidden = false;

  var sampleWords = getWords()
  var gameLength = document.getElementById("lengthInput")! as HTMLInputElement
  var promptList = document.getElementById("promptList")!
  var answerList = document.getElementById("answerList")!
  var resultsList = document.getElementById("resultsList")!

  var chosenWords: number[] = []    //Used for checking which words have already been randomly chosen for this round
  var chosenOptions: number[] = []  //Contains the random order of chosen words to be used in the selection element

  var quesData = JSON.parse(questionData)
  var removeIndex = []

  //Removes questions from the data that don't match the category being used
  for(let i = 0; i != quesData.length; i++)
  {
    if(quesData[i].indexOf(category) == -1)
    {
      removeIndex.unshift(i)
    }
  }

  for(let i = 0; i != removeIndex.length; i++)
  {
    quesData.splice(removeIndex[i], 1)
  }

  console.log(quesData)

  //Set and display random words
  for(let i = 0; i != +gameLength.value; i++)
  {
    var nextWord = -1

    //If the chosen word has already been chosen, choose another one
    while(chosenWords.indexOf(nextWord) != -1 || nextWord == -1)
    {
      nextWord = Math.floor(Math.random() * sampleWords[0].length)

      //The inverse of the player's accuracy for a word will be its likelihood of it being chosen with an accuracy limit of 10-90%
      for(let k = 0; k != quesData.length; k++)
      {
        if(quesData[k][1] == sampleWords[0][nextWord])
        {
          var accuracy = (quesData[k][4] / quesData[k][5]) * 100

          if(accuracy < 10)
          {
            accuracy = 10
          }
          else if(accuracy > 90)
          {
            accuracy = 90
          }

          console.log(quesData[k][1] + ": " + quesData[k][4] + "/" + quesData[k][5] + " = " + (100 - accuracy))

          if(Math.floor(Math.random() * 100) >= (100 - accuracy))
          {
            nextWord = -1
            console.log("REJECTED")
          }
        }
      }
    }

    chosenWords.push(nextWord)
  }

  //Set a random order of the chosen words
  for(let i = 0; i != +gameLength.value; i++)
  {
    var nextOption = Math.floor(Math.random() * sampleWords[0].length)

    //If the chosen word doesn't appear in the original list or it is already been chosen for the random order, choose another word
    while(chosenWords.indexOf(nextOption) == -1 || chosenOptions.indexOf(nextOption) != -1)
    {
      nextOption = Math.floor(Math.random() * sampleWords[0].length)
    }
    chosenOptions.push(nextOption)
  }

  //Create word displays, selection fields and answer symbol slots using the randomly chosen order
  for(let i = 0; i != +gameLength.value; i++)
  {
    if(!hasAudio)
    {
      promptList.innerHTML = promptList.innerHTML.concat("<ion-item id=word" + i + ">\
                                                            <ion-label>" + sampleWords[col1][chosenWords[i]] + "</ion-label>\
                                                          </ion-item>")
    }
    else
    {
      promptList.innerHTML = promptList.innerHTML.concat("<ion-item>\
                                                            <audio controls>\
                                                              <source  id=word" + i + " src='assets/audio/" + sampleWords[col1][chosenWords[i]] + ".mp3' type='audio/mpeg'>\
                                                            </audio>\
                                                          </ion-item>")
    }

    answerList.innerHTML = answerList.innerHTML.concat("<ion-item id=selection" + i + ">\
                                                          <ion-label>" + sampleWords[col2][chosenOptions[i]] + "</ion-label>\
                                                          <ion-reorder slot=\"end\"></ion-reorder>\
                                                        </ion-item>")

    resultsList.innerHTML = resultsList.innerHTML.concat("<ion-item id=answerResult" + i + ">\
                                                          </ion-item>")
  }
}

export function calculateScore(col1: number, col2: number, hasAudio: boolean): string[]
{
  document.getElementById("submitBtn")!.hidden = true;
  document.getElementById("scoreDisplay")!.hidden = false;
  document.getElementById("resultsTable")!.hidden = false;

  var gameLength = document.getElementById("lengthInput")! as HTMLInputElement
  var answerList = document.getElementById("answerList")! as HTMLSelectElement
  var answerOrder: string[] = answerList.innerText.split("\n")

  var sampleWords = getWords()
  var score = 0


  var arrayWord = new Array(gameLength)
  var arrayAnswer = new Array(gameLength)

  var userAnswers: string[] = []

  for(let i = 0; i != +gameLength.value; i++)
  {
    var currentWord = document.getElementById("word" + i)!  as HTMLInputElement
    var currentResult = document.getElementById("answerResult" + i)!

    answerList.disabled = true

    if(!hasAudio)
    {
      userAnswers.push(sampleWords[0][sampleWords[col1].indexOf(currentWord.innerText)])

      if(answerOrder[i] == sampleWords[col2][sampleWords[col1].indexOf(currentWord.innerText)])
      {
        score++;
        currentResult.innerHTML = currentResult.innerHTML.concat("<td>&#10004</td>")
        userAnswers.push("True")
      }
      else
      {
        currentResult.innerHTML = currentResult.innerHTML.concat("<td>&#10006</td>")
        userAnswers.push("False")
      }
    }
    else
    {
      var fileName = currentWord.src.slice(0,-4).substring(currentWord.src.indexOf("audio") + 6)

      userAnswers.push(sampleWords[0][sampleWords[col1].indexOf(fileName)])

      if(answerOrder[i] == sampleWords[col2][sampleWords[col1].indexOf(fileName)])
      {
        score++;
        currentResult.innerHTML = currentResult.innerHTML.concat("<ion-label>&#10004</ion-label>")
        userAnswers.push("True")
      }
      else
      {
        currentResult.innerHTML = currentResult.innerHTML.concat("<ion-label>&#10006</ion-label>")
        userAnswers.push("False")
      }
    }
  }
 
  document.getElementById("scoreDisplay")!.innerText =  "Score: " + score + "/" + gameLength.value + " (" + (Math.round((score / +gameLength.value) * 100)).toFixed(0) + "%)";

  return userAnswers
}

export function handleReorder(ev: CustomEvent<ItemReorderEventDetail>)
{
  /*This function edits a list after it has been rearranged so that the item that is being moved swaps with the item that is where it's moving to and
    the rest stay in the same position.
    Originally the list could only be rearranged to put an item above or the rest, shifting them all down, which was annoying*/

  ev.detail.complete();

  var answerList = document.getElementById("answerList")!

  if(ev.detail.from < ev.detail.to)       //Item moved down
  {
    var valueOverwrite = answerList.children[ev.detail.from + 1].children[0].innerHTML

    //Swap the to and from values
    answerList.children[ev.detail.from + 1].children[0].innerHTML = answerList.children[ev.detail.to].children[0].innerHTML

    //Move everything inbetween back down one
    if(ev.detail.to - ev.detail.from > 2)
    {
      for(let i = 0; i != (ev.detail.to - ev.detail.from - 1); i++)
      {
        answerList.children[ev.detail.to - i].children[0].innerHTML = answerList.children[ev.detail.to - i - 1].children[0].innerHTML
      }
    }

    if(ev.detail.to - ev.detail.from > 1)
    {
      answerList.children[ev.detail.from + 2].children[0].innerHTML = valueOverwrite
    }
  }
  else if(ev.detail.from > ev.detail.to)  //Item moved up
  {
    var valueOverwrite = answerList.children[ev.detail.from - 1].children[0].innerHTML

    //Swap the to and from values
    answerList.children[ev.detail.from - 1].children[0].innerHTML = answerList.children[ev.detail.to].children[0].innerHTML

    //Move everything inbetween back up one
    if(ev.detail.from - ev.detail.to > 2)
    {
      for(let i = 0; i != (ev.detail.from - ev.detail.to - 1); i++)
      {
        answerList.children[ev.detail.to + i].children[0].innerHTML = answerList.children[ev.detail.to + i + 1].children[0].innerHTML
      }
    }

    if(ev.detail.from - ev.detail.to > 1)
    {
      answerList.children[ev.detail.from - 2].children[0].innerHTML = valueOverwrite
    }
  }
}
