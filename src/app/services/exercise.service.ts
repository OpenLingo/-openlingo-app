import { Injectable } from '@angular/core';
import { ItemReorderEventDetail } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})

export class ExerciseService{

  constructor() {}

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

  generateExercise(optionCount: number, exercise: string, quesData: string[][], sampleWords: string[][]): number[][]
  {
    var chosenWords: number[] = []    //Used for checking which words have already been randomly chosen for this round
    var chosenOptions: number[] = []  //Contains the random order of chosen words to be used in the selection element

    console.log(quesData)

    //Set and display random words
    for(let i = 0; i != optionCount; i++)
    {
      var nextWord = -1

      //If the chosen word has already been chosen then don't add it to the list again
      while(chosenWords.indexOf(nextWord) != -1 || nextWord == -1 || (sampleWords[3][nextWord] == "-" && exercise == "definition"))
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
    for(let i = 0; i != optionCount; i++)
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

  calculateScore(optionCount: number, exercise: string, col1: number, col2: number, sampleWords: string[][]): string[]
  {
    var score = 0
    var userAnswers: string[] = []
    var answerList = document.getElementById("answerList")! as HTMLSelectElement

    document.getElementById("submitBtn")!.hidden = true;
    document.getElementById("scoreDisplay")!.hidden = false;

    //Removes blank space from HTML innertext to be used for answer checking-------------------------------------------
    var listCopy: string[] = answerList.innerText.split("\n")
    var answerOrder = []
    for(let i = listCopy.length - 1; i != -1; i--)
    {
      if(listCopy[i].trim().length)
      {
        answerOrder.unshift(listCopy[i])
      }
    }

    //For each question, the word and answer is recorded and the result is displayed to the user-----------------------
    //Variables wordAnswer and answerList are what is being compared to get the user's result
    var wordAnswer = document.getElementById("wordAnswer")!  as HTMLInputElement
    var wordResult = document.getElementById("answerResult0")

    if(exercise == "audio")
    {
      wordAnswer.innerText = wordAnswer.innerHTML.slice(30, wordAnswer.innerHTML.slice(30).indexOf(".") + 30)
    }

    userAnswers.push(sampleWords[0][sampleWords[col1].indexOf(wordAnswer.innerText)])

    //Begin Checking Answers-------------------------------------------------------------------------------------------
    var radioOptions = document.getElementsByName("radioSet")!
    var userSelection
    var answer = "-1"
    var k = 0

    //Disables all radio buttons
    for(let j = 0; j != optionCount; j++)
    {
      userSelection = radioOptions[j] as HTMLInputElement
      userSelection.disabled = true
    }

    //Goes through the radio buttons until the checked one is found
    while(k != optionCount)
    {
      userSelection = radioOptions[k] as HTMLInputElement

      if(userSelection.checked)
      {
        answer = userSelection.value
        break
      }

      k++
    }

    wordResult = document.getElementById("answerResult" + k)!

    if(answer == sampleWords[col2][sampleWords[col1].indexOf(wordAnswer.innerText)])
    {
      score++;

      if(k != optionCount)
      {
        wordResult.innerHTML = wordResult.innerHTML.concat("<b>&#10004</b>")
      }
    }
    else if(k != optionCount)
    {
      wordResult.innerHTML = wordResult.innerHTML.concat("<b>&#10006</b>")
    }

    if(k == optionCount)
    {
      userAnswers.push(answer)
    }
    else
    {
      userAnswers.push(sampleWords[0][sampleWords[col2].indexOf(answer)])
    }

    document.getElementById("scoreDisplay")!.innerText =  "Score: " + score + "/" + 1 + " (" + (Math.round((score / 1) * 100)).toFixed(0) + "%)";
    return userAnswers
  }
}
