import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ItemReorderEventDetail } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import sampleWords from '../../assets/sampleWords.json';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, HttpClientModule],
})

export class HomePage implements OnInit
{
  constructor(private httpInstance: HttpClient) {}

  ngOnInit()
  {
    localStorage.setItem("serverStatus", "False")

    console.log("Checking server status...")
    this.httpInstance.get("http://127.0.0.1:5000/views/get_questions/noun", {responseType: "text"}).subscribe((response) => { localStorage.setItem("serverStatus", "True"), console.log("...Success") })
  }

  clearData(): void
  {
    console.log("Clearing Data...")
    localStorage.clear()
    this.httpInstance.post("http://127.0.0.1:5000/views/save_scores", JSON.parse("[]"), {responseType: "text"}).subscribe((response) => { localStorage.setItem("serverStatus", "True"), console.log(response) })
  }
}

export function getWords(): string[][]
{
  var sampleArray: string[][] = [[],[],[],[]]

  for(let i = 0; i != sampleWords.nouns.length; i++)
  {
    sampleArray[0].push(sampleWords.nouns[i].word)
    sampleArray[1].push(sampleWords.nouns[i].translation)
    sampleArray[2].push(sampleWords.nouns[i].gender)
    sampleArray[3].push(sampleWords.nouns[i].category)
  }

  return sampleArray
}

export function pickExercise(currentExercise: string): string
{
  var options = ["ex-noun-match", "ex-gender-identify", "ex-audio-identify"]
  var selection = (Math.floor(Math.random() * 3))

  while(currentExercise == options[selection])
  {
    selection = (Math.floor(Math.random() * options.length))
  }

  return options[selection]
}

export function saveOfflineData(scoreData: string[]): void
{
  //This function saves each category's data individually, then merges them all together into a different item

  //With this there will always be combined data to send to the server and save as a whole
  //There will also be data separated into categories locally so the generateExercise function doesn't have to sort through it

  var categoryData = ("offlineData_" + scoreData[0])

  //If data doesn't exist for this category
  if (localStorage.getItem(categoryData) == null)
  {
    var answers: (string | number)[][] = []

    for(let i = 1; i != scoreData.length; i++)
    {
      if (i % 2 == 1)
      {
        answers.push([-1, scoreData[i], scoreData[0], -1, scoreData[i + 1]])
      }
    }

    localStorage.setItem(categoryData, JSON.stringify(answers))
  }
  else
  {
    var offlineData = JSON.parse(localStorage.getItem(categoryData)!)

    for(let i = 1; i != scoreData.length; i++)
    {
      if (i % 2 == 1)
      {
        offlineData.push([-1, scoreData[i], scoreData[0], -1, scoreData[i + 1]])
      }
    }

    localStorage.setItem(categoryData, JSON.stringify(offlineData))
  }

  //Combine the data for existing categories
  var allData = ""
  var categories = ["noun", "gender", "audio"]

  for (let i = 0; i != categories.length; i++)
  {
    if (localStorage.getItem(("offlineData_" + categories[i])) != null)
    {
      allData += localStorage.getItem(("offlineData_" + categories[i]))!
      allData = allData.replace("][", ",")
    }
  }

  localStorage.setItem("offlineData", allData)
}

export function generateExercise(quesData: (string | number)[][]): number[][]
{
  document.getElementById("startBtn")!.hidden = true;
  document.getElementById("instructionsTitle")!.hidden = true;
  document.getElementById("instructions")!.hidden = true;

  document.getElementById("promptTable")!.hidden = false;
  document.getElementById("answerTable")!.hidden = false;

  document.getElementById("submitBtn")!.hidden = false;

  var promptList = document.getElementById("promptList")!
  var answerList = document.getElementById("answerList")!
  var resultsList = document.getElementById("resultsList")!

  var gameLength = 8
  var sampleWords = getWords()
  var chosenWords: number[] = []    //Used for checking which words have already been randomly chosen for this round
  var chosenOptions: number[] = []  //Contains the random order of chosen words to be used in the selection element

  console.log(quesData)

  //Set and display random words
  for(let i = 0; i != gameLength; i++)
  {
    var nextWord = -1

    //If the chosen word has already been chosen then don't add it to the list again
    while(chosenWords.indexOf(nextWord) != -1 || nextWord == -1)
    {
      nextWord = Math.floor(Math.random() * sampleWords[0].length)

      //If the chosen word has already been chosen, don't bother looking at its accuracy
      if (chosenWords.indexOf(nextWord) == -1)
      {
        var appearances = 0
        var correct = 0

        var accuracy = 0
        var exists = false

        //The inverse of the player's accuracy for a word will be its likelihood of it being chosen with an accuracy limit of 5-95%
        for(let k = 0; k != quesData.length; k++)
        {
          //If the word has been chosen before
          if(quesData[k][1] == sampleWords[0][nextWord])
          {
            appearances++

            if (quesData[k][1] == quesData[k][4] || quesData[k][4] == "True")
            {
              correct++
            }

            exists = true
          }

          if (exists && k == quesData.length - 1)
          {
            accuracy = (correct / appearances) * 100

            if (accuracy < 5)
            {
              accuracy = 5
            }
            else if (accuracy > 95)
            {
              accuracy = 95
            }

            console.log(sampleWords[0][nextWord] + ": " + correct + "/" + appearances + " = " + (100 - accuracy))

            if (Math.floor(Math.random() * 100) >= (100 - accuracy))
            {
              nextWord = -1
              console.log("REJECTED")
            }
          }
        }
      }
    }

    chosenWords.push(nextWord)
  }

  //Set a random order of the chosen words
  for(let i = 0; i != gameLength; i++)
  {
    var nextOption = Math.floor(Math.random() * sampleWords[0].length)

    //If the chosen word doesn't appear in the original list or it is already been chosen for the random order, choose another word
    while(chosenWords.indexOf(nextOption) == -1 || chosenOptions.indexOf(nextOption) != -1)
    {
      nextOption = Math.floor(Math.random() * sampleWords[0].length)
    }
    chosenOptions.push(nextOption)
  }

  return [chosenWords, chosenOptions]
}

export function calculateScore(col1: number, col2: number, exercise: string): string[]
{
  document.getElementById("submitBtn")!.hidden = true;
  document.getElementById("scoreDisplay")!.hidden = false;
  document.getElementById("resultsTable")!.hidden = false;

  var answerList = document.getElementById("answerList")! as HTMLSelectElement
  var answerOrder: string[] = answerList.innerText.split("\n")

  var sampleWords = getWords()
  var gameLength = 8
  var score = 0

  var userAnswers: string[] = []

  //For each question, the word and answer is recorded and the result is displayed to the user
  for(let i = 0; i != gameLength; i++)
  {
    var currentWord = document.getElementById("word" + i)!  as HTMLInputElement
    var currentResult = document.getElementById("answerResult" + i)!

    answerList.disabled = true

    if(exercise == "audio")
    {
      currentWord.innerText = currentWord.src.slice(0,-4).substring(currentWord.src.indexOf("audio") + 6)
    }

    userAnswers.push(sampleWords[0][sampleWords[col1].indexOf(currentWord.innerText)])

    //Audio-----------------------------------------------------------------------------------------------------------
    if(exercise == "audio")
    {
      if(answerOrder[i] == sampleWords[col2][sampleWords[col1].indexOf(currentWord.innerText)])
      {
        score++;
        currentResult.innerHTML = currentResult.innerHTML.concat("<ion-label>&#10004</ion-label>")
      }
      else
      {
        currentResult.innerHTML = currentResult.innerHTML.concat("<ion-label>&#10006</ion-label>")
      }

      userAnswers.push(sampleWords[0][sampleWords[col2].indexOf(answerOrder[i])])
    }
    //Gender-----------------------------------------------------------------------------------------------------------
    else if(exercise == "gender")
    {
      var genderOptions = ["Masculine", "Feminine", "Neutral", "null"]
      var currentAnswer = document.getElementsByName("radioSet" + i)!
      var currentSelection
      var k = 0

      //Disables all radio buttons
      for(let j = 0; j != 3; j++)
      {
        currentSelection = currentAnswer[j] as HTMLInputElement
        currentSelection.disabled = true
      }

      //Goes through the three radio buttons until the checked one is found
      while(k != 3)
      {
        currentSelection = currentAnswer[k] as HTMLInputElement

        if(currentSelection.checked)
        {
          break
        }
        k++
      }

      //The index of the checked radio button is used to get the user's answer
      if(genderOptions[k] == sampleWords[col2][sampleWords[col1].indexOf(currentWord.innerText)])
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
    //Noun-----------------------------------------------------------------------------------------------------------
    else
    {
      if(answerOrder[i] == sampleWords[col2][sampleWords[col1].indexOf(currentWord.innerText)])
      {
        score++;
        currentResult.innerHTML = currentResult.innerHTML.concat("<td>&#10004</td>")
      }
      else
      {
        currentResult.innerHTML = currentResult.innerHTML.concat("<td>&#10006</td>")
      }

      userAnswers.push(sampleWords[0][sampleWords[col2].indexOf(answerOrder[i])])
    }
  }

  document.getElementById("scoreDisplay")!.innerText =  "Score: " + score + "/" + gameLength + " (" + (Math.round((score / gameLength) * 100)).toFixed(0) + "%)";
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
