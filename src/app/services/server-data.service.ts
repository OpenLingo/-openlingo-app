import { Injectable, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from "rxjs";
import { catchError, map, tap } from 'rxjs/operators';
import { ExerciseService } from "../services/exercise.service";

import sampleWords from '../../assets/sampleWords.json';

@Injectable({
  providedIn: 'root'
})

export class ServerDataService {

  constructor(private exerciseService: ExerciseService) { }

  serverURL = "http://127.0.0.1:5000/views/"

  async checkStatus(http: HttpClient): Promise<void>
  {
    var response = null

    var onlineStatus = document.getElementById("onlineStatus")!
    var onlineButton = document.getElementById("onlineButton")! as HTMLInputElement
    var updateButton = document.getElementById("updateButton")! as HTMLInputElement

    if(!this.getServerStatus())
    {
      onlineButton.disabled = true
      updateButton.disabled = true
      onlineStatus.innerHTML = "<em>Connecting...</em>"
    }

    localStorage.setItem("serverStatus", "False")
    console.log("Checking server status...")

    try
    {
      response  = await fetch(this.serverURL + "database/noun/1")

      onlineButton.disabled = true
      onlineStatus.innerHTML = "<em>Online &#10004;</em>"

      updateButton.disabled = false
    }
    catch
    {
      onlineButton.disabled = false
      updateButton.disabled = true
      onlineStatus.innerHTML = "<em>Offline &#10006;</em>"

      console.log("...could not connect to server.")
    }

    if(response != null)
    {
      localStorage.setItem("serverStatus", "True")
      console.log("...server Success")
    }
  }

  getServerStatus(): boolean
  {
    return localStorage.getItem("serverStatus")! == "True"
  }

  getDownloadStatus(): boolean
  {
    return JSON.parse(localStorage.getItem("offlineWordData")!)[0][0] != "House"
  }

  async getServerData(category: string): Promise<any>
  {
    if(this.getServerStatus())
    {
      const response = await fetch(this.serverURL + "performance_data/get_data/" + category)

      console.log("GETing Performance Data...")
      console.log("...GET Success")

      return await response.json()
    }
  }

  postServerData(http: HttpClient, postData?: string): void
  {
    var data = JSON.parse(localStorage.getItem("offlineData")!)

    if(postData != null)
    {
      data = JSON.parse(postData)
    }

    if(this.getServerStatus())
    {
      console.log("POSTing Performance Data...")
      http.post(this.serverURL + "performance_data/save_data", data, {responseType: "text"})
      .subscribe(response => console.log(response))
    }
  }

  async getDatabaseData(options: string): Promise<any>
  {
    const response = await fetch(this.serverURL + "database/" + options)

    return await response.json()
  }

  generateOfflineWords(): string[][]
  {
    var sampleArray: string[][] = [[],[],[],[]]

    for(let i = 0; i != sampleWords.nouns.length; i++)
    {
      sampleArray[0].push(sampleWords.nouns[i].word)
      sampleArray[1].push(sampleWords.nouns[i].translation)
      sampleArray[2].push(sampleWords.nouns[i].gender)
      sampleArray[3].push(sampleWords.nouns[i].definition)
    }

    return sampleArray
  }

  async getWords(reset?: boolean): Promise<void>
  {
    var updateButton = document.getElementById("updateButton")! as HTMLInputElement
    var sampleArray: string[][] = [[],[],[],[]]

    updateButton.disabled = true

    if(!this.getServerStatus())
    {
      sampleArray = this.generateOfflineWords()
    }
    else
    {
      document.getElementById("downloadStatus")!.innerHTML = "<em>Downloading Word Data...</em>"

      var databaseData = await this.getDatabaseData("noun")

      for(let i = 0; i != databaseData.length; i++)
      {
        if(databaseData[i].language_id == 1)
        {
          //Gets the German word and id that matches the current English word
          var translation = await this.getDatabaseData("noun_translation/" + (databaseData[i].id))

          //Gets the rest of the German word's data using the id just found
          var translationData = await this.getDatabaseData("noun/" + translation[0].id)

          sampleArray[0].push(databaseData[i].word)
          sampleArray[1].push(translation[0].word)
          sampleArray[2].push(translationData.gender)
          sampleArray[3].push("definition " + i)
        }
      }

      updateButton.disabled = false

      document.getElementById("downloadStatus")!.innerHTML = "<em>Using Downloaded Data &#10004;</em>"
    }

    localStorage.setItem("offlineWordData", JSON.stringify(sampleArray))
  }

  saveOfflineData(scoreData: string[]): void
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

    for (let i = 0; i != this.exerciseService.exercises[0].length; i++)
    {
      if (localStorage.getItem(("offlineData_" + this.exerciseService.exercises[0][i])) != null)
      {
        allData += localStorage.getItem(("offlineData_" + this.exerciseService.exercises[0][i]))!
        allData = allData.replace("][", ",")
      }
    }

    localStorage.setItem("offlineData", allData)
  }
}
