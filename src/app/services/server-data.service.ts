import { Injectable, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from "rxjs";
import { catchError, map, tap } from 'rxjs/operators';

import sampleWords from '../../assets/sampleWords.json';

@Injectable({
  providedIn: 'root'
})

export class ServerDataService {

  constructor() { }

  //Server refers to the app server that is used to store user data
  //Database refers to the external server containing word and language data

  serverGetURL = "http://127.0.0.1:5000/views/get_questions/"
  serverPostURL = "http://127.0.0.1:5000/views/save_scores"
  databaseURL = "http://127.0.0.2:5000/api/"

  categories = ["noun", "definition", "gender", "audio"]
  exercises = ["ex-noun-match", "ex-definition-match", "ex-gender-identify", "ex-audio-identify"]

  sampleWords: string[][] = []

  testString = "empty"

  async checkStatus(http: HttpClient, service: string): Promise<void>
  {
    var response = null

    document.getElementById("onlineStatus")!.innerHTML = "<em>Online &#10006;</em>"

    localStorage.setItem(service + "Status", "False")
    console.log("Checking " + service + " status...")

    try
    {
      if(service == "server")
      {
        response  = await fetch(this.serverGetURL + "noun")
      }
      else
      {
        response  = await fetch(this.databaseURL + "noun")
        document.getElementById("onlineStatus")!.innerHTML = "<em>Online &#10004;</em>"
      }
    }
    catch
    {
      console.log("...could not connect to " + service)
    }

    if(response != null)
    {
      localStorage.setItem(service + "Status", "True")
      console.log("..." + service + " Success")
    }
  }

  getServerStatus(): boolean
  {
    return localStorage.getItem("serverStatus")! == "True"
  }

  getDatabaseStatus(): boolean
  {
    return localStorage.getItem("databaseStatus")! == "True"
  }

  async getServerData(category: string): Promise<any>
  {
    if(this.getServerStatus())
    {
      const response = await fetch(this.serverGetURL + category)

      console.log("GETing Question Data...")
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
      console.log("POSTing Question Data...")
      http.post(this.serverPostURL, data, {responseType: "text"})
      .subscribe(response => console.log(response))
    }
  }

  async getDatabaseData(options: string): Promise<any>
  {
    const response = await fetch(this.databaseURL + options)

    return await response.json()
  }

  async getWords(): Promise<string[][]>
  {
    var sampleArray: string[][] = [[],[],[],[]]

    if(!this.getDatabaseStatus())
    {
      if(localStorage.getItem("offlineWordData") == null)
      {
        for(let i = 0; i != sampleWords.nouns.length; i++)
        {
          sampleArray[0].push(sampleWords.nouns[i].word)
          sampleArray[1].push(sampleWords.nouns[i].translation)
          sampleArray[2].push(sampleWords.nouns[i].gender)
          sampleArray[3].push(sampleWords.nouns[i].definition)
        }
      }
      else
      {
        sampleArray = JSON.parse(localStorage.getItem("offlineWordData")!)
      }
    }
    else
    {
      var databaseData = await this.getDatabaseData("noun")

      for(let i = 0; i != 9; i++)
      {
        var translation = await this.getDatabaseData("noun_translation/" + (i + 1))
        var translationData = await this.getDatabaseData("noun/" + translation[0].id)

        sampleArray[0].push(databaseData[i].word)
        sampleArray[1].push(translation[0].word)
        sampleArray[2].push(translationData.gender)
        sampleArray[3].push("definition " + i)

        localStorage.setItem("offlineWordData", JSON.stringify(sampleArray))
      }

    }
    return sampleArray
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

    for (let i = 0; i != this.categories.length; i++)
    {
      if (localStorage.getItem(("offlineData_" + this.categories[i])) != null)
      {
        allData += localStorage.getItem(("offlineData_" + this.categories[i]))!
        allData = allData.replace("][", ",")
      }
    }

    localStorage.setItem("offlineData", allData)
  }
}
