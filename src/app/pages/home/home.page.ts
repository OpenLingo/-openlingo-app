import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
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
  constructor(private serverDataService: ServerDataService, private http: HttpClient) {}

  async ngOnInit()
  {
    this.connectOnline()
  }

  async connectOnline()
  {
    await this.serverDataService.checkStatus(this.http, "server")
    await this.serverDataService.checkStatus(this.http, "database")
  }

  async clearData()
  {
    console.log("Clearing Data...")

    if(this.serverDataService.getServerStatus())
    {
      this.serverDataService.postServerData(this.http, "[]")
      console.log("...all data cleared")
    }
    else
    {
      console.log("...server data could not be cleared, only local storage has been cleared")
    }

    localStorage.clear()
  }
}
