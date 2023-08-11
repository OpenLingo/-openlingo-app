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

  serverGetURL = "http://127.0.0.1:5000/views/get_questions/"
  serverPostURL = "http://127.0.0.1:5000/views/save_scores"
  databaseURL = "http://10.1.10.90:5000"

  categories = ["noun", "deffinition", "gender", "audio"]
  exercises = ["ex-noun-match", "ex-definition-match", "ex-gender-identify", "ex-audio-identify"]

  getServerStatus(): boolean
  {
    return localStorage.getItem("serverStatus")! == "True"
  }

  getDatabaseStatus(): boolean
  {
    return localStorage.getItem("databaseStatus")! == "True"
  }

  async getServerData(http: HttpClient, category: string): Promise<any>
  {
    if(this.getServerStatus())
    {
      const response = await fetch(this.serverGetURL + category)

      console.log("GETing Question Data...")
      console.log("...Success")

      return await response.json()
    }
  }

  postServerData(http: HttpClient): void
  {
    if(this.getServerStatus())
    {
      console.log("POSTing Question Data...")
      http.post(this.serverPostURL, JSON.parse(localStorage.getItem("offlineData")!), {responseType: "text"})
      .subscribe(response => console.log(response))
    }
  }

  getWords(): string[][]
  {
    var sampleArray: string[][] = [[],[],[],[]]
    var databaseWords = localStorage.getItem("databaseWords")!

    if(databaseWords == null)
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
