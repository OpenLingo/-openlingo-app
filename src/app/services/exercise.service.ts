import { Injectable } from '@angular/core';
import { ItemReorderEventDetail } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})

export class ExerciseService{

  constructor() {}

  gameLength = 8

  exercises = [["noun", "definition", "gender", "audio"],
               ["ex-noun-match", "ex-definition-match", "ex-gender-identify", "ex-audio-identify"]]

  //Used when looping through multiple exercises
  pickExercise(currentExercise: string): string
  {
    var selection = (Math.floor(Math.random() * 4))

    while(currentExercise == this.exercises[1][selection])
    {
      selection = (Math.floor(Math.random() * this.exercises[1].length))
    }

    return this.exercises[1][selection]
  }

  handleLoop(loops: number)
  {
    if(loops > 0)
    {
      document.getElementById("nextBtn")!.hidden = false
      document.getElementById("remainingEx")!.innerHTML = ("Exercises Remaining: " + loops)
    }
    else if(loops == 0)
    {
      document.getElementById("finishBtn")!.hidden = false
      document.getElementById("remainingEx")!.innerHTML = ("Exercises Remaining: " + loops)
    }
    else
    {
      document.getElementById("againBtn")!.hidden = false;
    }
  }

  generateExercise(quesData: string[][], sampleWords: string[][]): number[][]
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

    var chosenWords: number[] = []    //Used for checking which words have already been randomly chosen for this round
    var chosenOptions: number[] = []  //Contains the random order of chosen words to be used in the selection element

    console.log(quesData)

    //Set and display random words
    for(let i = 0; i != this.gameLength; i++)
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

              //The word needs to appear a few times before it can start being rejected
              if (Math.floor(Math.random() * 100) >= (100 - accuracy) && appearances > 2)
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
    for(let i = 0; i != this.gameLength; i++)
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

  calculateScore(col1: number, col2: number, exercise: string, sampleWords: string[][]): string[]
  {
    var score = 0
    var userAnswers: string[] = []
    var answerList = document.getElementById("answerList")! as HTMLSelectElement

    document.getElementById("submitBtn")!.hidden = true;
    document.getElementById("scoreDisplay")!.hidden = false;
    answerList.disabled = true

    //Removes blank space from HTML innertext to be used for answer checking
    var listCopy: string[] = answerList.innerText.split("\n")
    var answerOrder = []
    for(let i = listCopy.length - 1; i != -1; i--)
    {
      if(listCopy[i].trim().length)
      {
        answerOrder.unshift(listCopy[i])
      }
    }

    //Finds the arrangement of answers to display the correct result
    var currentIndex = 0
    var resultIndexes = []
    for(let i = 0; i != this.gameLength; i++)
    {
      currentIndex = answerList.innerHTML.indexOf("answerResult", currentIndex + 2)

      resultIndexes.push(answerList.innerHTML[currentIndex + 12])
    }

    //For each question, the word and answer is recorded and the result is displayed to the user
    //Variables currentWord and answerList are what is being compared to get the user's result
    for(let i = 0; i != this.gameLength; i++)
    {
      var currentWord = document.getElementById("word" + i)!  as HTMLInputElement
      var currentResult = document.getElementById("answerResult" + resultIndexes[i])!    //Element containing cross or check symbol

      if(exercise == "audio")
      {
        currentWord.innerText = currentWord.src.slice(0,-4).substring(currentWord.src.indexOf("audio") + 6 + 4)
      }

      userAnswers.push(sampleWords[0][sampleWords[col1].indexOf(currentWord.innerText)])

      //Gender-----------------------------------------------------------------------------------------------------------
      if(exercise == "gender")
      {
        var genderOptions = ["m", "f", "n", "null"]
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
          currentResult.innerHTML = currentResult.innerHTML.concat("<b>&#10004</b>")
          userAnswers.push("True")
        }
        else
        {
          currentResult.innerHTML = currentResult.innerHTML.concat("<b>&#10006</b>")
          userAnswers.push("False")
        }
      }
      //All other exercises----------------------------------------------------------------------------------------------
      else
      {
        if(sampleWords[col1].indexOf(currentWord.innerText) == sampleWords[col2].indexOf(answerOrder[i]))
        {
          score++;
          currentResult.innerHTML = currentResult.innerHTML.concat("<b>&#10004</b>")
        }
        else
        {
          currentResult.innerHTML = currentResult.innerHTML.concat("<b>&#10006</b>")
        }

        userAnswers.push(sampleWords[0][sampleWords[col2].indexOf(answerOrder[i])])
      }
    }

    document.getElementById("scoreDisplay")!.innerText =  "Score: " + score + "/" + this.gameLength + " (" + (Math.round((score / this.gameLength) * 100)).toFixed(0) + "%)";
    return userAnswers
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>)
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
}
