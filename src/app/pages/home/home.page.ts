import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExerciseService } from "../../services/exercise.service";
import { ServerDataService } from "../../services/server-data.service";
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, HttpClientModule],
})

export class HomePage implements OnInit
{
  constructor(private exerciseService: ExerciseService, private serverDataService: ServerDataService, private http: HttpClient) {}

  async ngOnInit()
  {
    document.getElementById("homeTable")!.style.display = "inline"
    document.getElementById("exerciseTable")!.style.display = "none"
    document.getElementById("settingsTable")!.style.display = "none"

    var updateButton = document.getElementById("updateButton")! as HTMLInputElement

    this.updateDisplays()

    await this.connectOnline()

    if(localStorage.getItem("offlineWordData")! == null)
    {
      await this.serverDataService.getWords()
    }
  }

  async connectOnline()
  {
    await this.serverDataService.checkStatus(this.http)
  }

  async updateData()
  {
    await this.serverDataService.getWords()
  }

  updateDisplays()
  {
    if(this.serverDataService.getDownloadStatus())
    {
      document.getElementById("downloadStatus")!.innerHTML = "<em>Using Online Data</em>"
    }
    else
    {
      document.getElementById("downloadStatus")!.innerHTML = "<em>Using Offline Data</em>"
    }
  }

  async deleteWordData()
  {
    if(confirm("This will delete all word data that has been downloaded from the database.\n\nUse this if any exercises are not functioning."))
    {
      localStorage.removeItem("offlineWordData")

      this.serverDataService.generateOfflineData()
      this.serverDataService.saveAccuracy()

      this.updateDisplays()
    }
  }

  async clearData()
  {
    if(confirm("Are you sure you want to clear all of your performance data?\n\nThis data is used to better choose questions based on your answers."))
    {
      console.log("Clearing Data...")

      localStorage.removeItem("offlineData")
      this.serverDataService.clearAccuracy()

      for(let i = 0; i != this.exerciseService.exercises[0].length; i++)
      {
        localStorage.removeItem("offlineData_" + this.exerciseService.exercises[0][i])
      }

      if(this.serverDataService.getServerStatus())
      {
        await this.serverDataService.postServerData(this.http, "[]")
        console.log("...all data cleared")
      }
      else
      {
        console.log("...server data could not be cleared, only local storage has been cleared")
      }
    }
  }

  moreInfo()
  {
    alert("Icons from: https://www.flaticon.com.")
  }

  toggleExercises()
  {
    if(document.getElementById("homeTable")!.style.display == "inline")
    {
      document.getElementById("homeTable")!.style.display = "none"
      document.getElementById("exerciseTable")!.style.display = "inline"
    }
    else
    {
      document.getElementById("homeTable")!.style.display = "inline"
      document.getElementById("exerciseTable")!.style.display = "none"
    }
  }

  toggleSettings()
  {
    if(document.getElementById("settingsTable")!.style.display == "inline")
    {
      document.getElementById("settingsTable")!.style.display = "none"
      document.getElementById("homeTable")!.style.display = "inline"
    }
    else
    {
      document.getElementById("settingsTable")!.style.display = "inline"
      document.getElementById("homeTable")!.style.display = "none"
      document.getElementById("exerciseTable")!.style.display = "none"
    }
  }
}
