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
  constructor(private serverDataService: ServerDataService, private httpInstance: HttpClient) {}

  ngOnInit()
  {
    //Server refers to the app server that is used to store user data
    //Database refers to the external server containing word and language data
    localStorage.setItem("serverStatus", "False")
    localStorage.setItem("databaseStatus", "False")

    console.log("Checking server status...")
    this.httpInstance.get(this.serverDataService.serverGetURL + "noun",{responseType: "text"})
    .subscribe((response) => { localStorage.setItem("serverStatus", "True"), console.log("...Success") })

    console.log("Checking database status...")
    this.httpInstance.get(this.serverDataService.databaseURL + "/api/noun", {responseType: "text"})
    .subscribe((response) => { localStorage.setItem("databaseStatus", "True"), console.log("...Success") })
  }

  clearData(): void
  {
    console.log("Clearing Data...")
    localStorage.clear()
    this.httpInstance.post(this.serverDataService.serverPostURL, JSON.parse("[]"), {responseType: "text"})
    .subscribe((response) => { localStorage.setItem("serverStatus", "True"), console.log(response) })
  }
}
