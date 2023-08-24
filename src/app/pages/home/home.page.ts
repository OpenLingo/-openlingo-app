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
    this.connectOnline()
  }

  async connectOnline()
  {
    await this.serverDataService.checkStatus(this.http, "database")
    await this.serverDataService.checkStatus(this.http, "server")
  }

  async clearData()
  {
    console.log("Clearing Data...")

    localStorage.removeItem("offlineData")
    localStorage.removeItem("offlineWordData")

    for(let i = 0; i != this.exerciseService.exercises[0].length; i++)
    {
      localStorage.removeItem("offlineData_" + this.exerciseService.exercises[0][i])
    }

    if(this.serverDataService.getServerStatus())
    {
      this.serverDataService.postServerData(this.http, "[]")
      console.log("...all data cleared")
    }
    else
    {
      console.log("...server data could not be cleared, only local storage has been cleared")
    }
  }
}
