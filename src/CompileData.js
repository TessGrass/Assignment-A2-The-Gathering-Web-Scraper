/**
 * The application module.
 *
 * @author Therese Grass <tg222kv@student.lnu.se>
 * @version 1.1.0
 */

 import { JSDOM } from 'jsdom'
 import fetch from 'node-fetch'
import Scraper from './Scraper.js'

/**
 * Encapsulates a Node application.
 */
export class CompileData {
  constructor(url) {
    this.url = url
    this.scraper = new Scraper()
    this.links = []
  }

  async run () {

    const links = await this.retrieveData('a', 'href') // skickar argumenten till retrieveData metoden.
    this.links = [...new Set(links)] // Sparas i en array
    console.log(this.links)
    this.checkCalendar()
  }

  async retrieveData (tag, value) { // tar emot argumenten
    const data = await this.scraper.scraperInit(this.url) // Får domData från Scraper med värdet i this.url
    return Array.from(data.window.document.querySelectorAll(tag)).map(links => links[value]) // Array.from skapar en array av en sträng. links[value] är andra argumentet. 
  }
  async checkCalendar () {
    this.url = this.links[0] // this.url sätts om till första indexet i vår array.
    const calendarUrl = await this.retrieveData('a', 'href') // calenderUrl är en array med svaret vi fick av "return Array.from.." i retrieveData.
    console.log(calendarUrl)
    calendarUrl.forEach( async (name) => { // För varje element så körs detta
      this.url = this.links[0] + name.substring(2,name.length) //substring extraherar delar av en sträng.
      const data = await this.retrieveData('td', 'textContent') // metoden retrieveData kallas på. 
      console.log(data) // -> data behöver lagras eftersom data skrivs över i varje iteration.
    })
  }

  async checkCinema () {
      
  }

  async checkDinner () {
      
  }
}