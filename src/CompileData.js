/**
 * The CompileData module.
 *
 * @author Therese Grass <tg222kv@student.lnu.se>
 * @version 1.1.0
 */

import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'
import Scraper from './Scraper.js'

/**
 *
 */
export class CompileData {
  /**
   * @param url
   */
  constructor (url) {
    this.url = url
    this.scraper = new Scraper()
    this.links = []
    this.dataContainer = []
    this.weekDay = []
    this.arrayOfMovies = []
    this.cinemaResult = []
    this.dinners = []
  }

  /**
   *
   */
  async run () {
    const links = await this.retrieveData('a', 'href') // skickar argumenten till retrieveData metoden.
    this.links = [...new Set(links)] // Sparas i en array
    this.checkCalendar()
  }

  /**
   * @param tag
   * @param value
   */
  async retrieveData (tag, value) { // tar emot argumenten
    const data = await this.scraper.runScraper(this.url) // Får domData från Scraper med värdet i this.url
    return Array.from(data.window.document.querySelectorAll(tag)).map(links => links[value]) // Array.from skapar en array av en sträng. links[value] är andra argumentet.
  }

  /**
   *
   */
   async checkCalendar () {
    const object2 = {}
    this.url = this.links[0] // this.url sätts om till första indexet i vår array.
    const calendarUrl = await this.retrieveData('a', 'href') // calenderUrl är en array med svaret vi fick av scraper "return Array.from.." via retrieveData.
    console.log(calendarUrl)
    console.log('ovanför')
    await Promise.all(calendarUrl.map(async name => {
      this.url = this.links[0] + name.substring(2, name.length) // substring extraherar delar av en sträng. (dvs i ./paul.html så tas ./ bort)
      const data = await this.retrieveData('td', 'textContent') // metoden retrieveData kallas på. 'td' och 'textContent' skickas med i det här fallet.
      const lowerCaseData = data.map(name => name.toLowerCase())
      const weekdays = await this.retrieveData('th', 'textContent')
      weekdays.forEach((value, index) => {
        if (lowerCaseData[index] === 'ok') {
          if (!object2[value]) {
            object2[value] = 0
          }
          object2[value] += 1
        }
      })
    }))

    const validDays = Object.entries(object2)
      .map(([key, value]) => value === 3 && key)
      .filter(day => day)

    validDays.forEach(day => {
      if (day === 'Friday') this.weekDay.push('05')
      if (day === 'Saturday') this.weekDay.push('06')
      if (day === 'Sunday') this.weekDay.push('07')

      
    })
    this.checkCinema()
  }

  /**
   *
   */
  async checkCinema () {
    this.url = this.links[1]
    
    console.log(this.url)
    // const cinema = await this.retrieveData('p')
    const cinema = await this.scraper.runScraper(this.url) // Får domData från Scraper med värdet i this.url
    const cinema2 = Array.from(cinema.window.document.querySelectorAll('#movie > option'))
      .map(movie => {
        return {
          number: movie.value,
          name: movie.textContent
        }
      })

      for (let movie = 1; movie < cinema2.length; movie++) { // för varje film
        for (let day = 5; day < 8; day++) {

          let checkAvailaibility = await fetch(`https://courselab.lnu.se/scraper-site-1/cinema/check?day=0${day}&movie=0${movie}`)
          checkAvailaibility = await checkAvailaibility.json()

          const result = checkAvailaibility.filter(obj => {
            return obj.status === 1
          })
          this.arrayOfMovies.push(result)
          this.arrayOfMovies = this.arrayOfMovies.flat()
      }

      
      






    // console.log(await this.scraper.runScraper(this.url))

    // const links = await this.retrieveData('a', 'href')
    // console.log(links)
      }
      this.compareDaysAndMovies()
  }

  async compareDaysAndMovies() {
    for (const movie of this.arrayOfMovies) {
      for (const day of this.weekDay) {
        if (movie.day === day) this.cinemaResult.push(movie)
      }
    }
    this.checkDinner()
  }



  compareDinnerDays() {

  }
}
