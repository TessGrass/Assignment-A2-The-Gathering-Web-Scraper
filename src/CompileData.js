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

    const links = await this.retrieveData('a', 'href')
    this.links = [...new Set(links)]
    console.log(this.links)
    this.checkCalendar()
  }

  async retrieveData (tag, value) {
    const data = await this.scraper.scraperInit(this.url)
    return Array.from(data.window.document.querySelectorAll(tag)).map(links => links[value])
  }
  async checkCalendar () {
    this.url = this.links[0]
    const calendarUrl = await this.retrieveData('a', 'href')
    console.log(calendarUrl)
    calendarUrl.forEach( async (name) => {
      this.url = this.links[0] + name.substring(2,name.length)
      const data = await this.retrieveData('td', 'textContent')
      console.log(data)
    })
  }

  async checkCinema () {
      
  }

  async checkDinner () {
      
  }
}