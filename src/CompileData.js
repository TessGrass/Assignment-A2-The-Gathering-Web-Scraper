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
 * Represents a web scraper application.
 */
export class CompileData {
  /**
   * Creates an instance of the current type.
   *
   * @param {string} url - represent the URL that start the application.
   */
  constructor (url) {
    this.orginalUrl = url
    this.url = url
    this.scraper = new Scraper()
    this.links = []
    this.dataContainer = []
    this.weekDay = []
    this.arrayOfMovies = []
    this.cinemaResult = []
    this.dinners = []
    this.matchedDaysAndDinners = []
    this.namedDays = []
    this.dinnerObject = []
  }

  /**
   * Sends and retrieve data from retrieveData method. Removes received duplicates.
   */
  async run () {
    const links = await this.retrieveData('a', 'href') // skickar argumenten till retrieveData metoden.
    this.links = [...new Set(links)] // Sparas i en array
    this.checkCalendar()
  }

  /**
   * Gets data from scraper from a given url.
   * 
   * @param {string} tag - the recieved argument.
   * @param {string} value - the recieved argument.
   * @returns {array} - Returns an array of a string with the values found in the parameter.
   */
  async retrieveData (tag, value) { // tar emot argumenten
    const data = await this.scraper.runScraper(this.url) // Får domData från Scraper med värdet i this.url
    // console.log(Array.from(data.window.document.querySelectorAll(tag)).map(links => links[value]))
    return Array.from(data.window.document.querySelectorAll(tag)).map(links => links[value]) // Array.from skapar en array av en sträng. links[value] är andra argumentet.
  }

  /**
   * Checks the persons calendar for available days.
   */
  async checkCalendar () {
    const object2 = {}
    this.url = this.links[0] // this.url sätts om till första indexet i vår array.
    const calendarUrl = await this.retrieveData('a', 'href') // calenderUrl är en array med svaret vi fick av scraper "return Array.from.." via retrieveData.

    await Promise.all(calendarUrl.map(async name => {
      this.url = this.links[0] + name.substring(2, name.length) // substring extraherar delar av en sträng. (dvs i ./paul.html så tas ./ bort)
      const data = await this.retrieveData('td', 'textContent') // metoden retrieveData kallas på. 'td' och 'textContent' skickas med i det här fallet.
      console.log(data)
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
   * 
   */
  async checkCinema () {
    this.url = this.links[1]

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

        this.arrayOfMovies.forEach(obj => {
          if (obj.movie === '01') obj.name = cinema2[1].name
          else if (obj.movie === '02') obj.name = cinema2[2].name
          else if (obj.movie === '03') obj.name = cinema2[3].name
        })
      }

      // console.log(await this.scraper.runScraper(this.url))

    // const links = await this.retrieveData('a', 'href')
    // console.log(links)
    }
    this.compareDaysAndMovies()
  }

  /**
   *
   */
  async compareDaysAndMovies () {
    for (const movie of this.arrayOfMovies) {
      for (const day of this.weekDay) {
        if (movie.day === day) this.cinemaResult.push(movie)
      }
    }
    this.checkDinner()
  }

  /**
   *
   */
  async checkDinner () {
    let dom

    // ändra så site blir dynamisk
    // https://cscloud6-127.lnu.se/scraper-site-2/dinner/login

    await fetch(`${this.orginalUrl}/dinner/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      },
      body: 'username=zeke&password=coys&submit=login',
      redirect: 'manual',
      credentials: 'include'
    }).then(async resp => {
      if (resp.status === 302) {
        dom = await fetch(resp.headers.get('location'), {
          method: 'GET',
          headers: {
            Cookie: resp.headers.get('set-cookie').substring(0, resp.headers.get('set-cookie').indexOf(';'))
          }
        })
      }
      const dinnerDom = new JSDOM(await dom.text())
      this.dinners = Array.from(dinnerDom.window.document.querySelectorAll('input'))
        .map(input => input.value)
      this.dinners.pop()
    })

    this.compareDinnerDays()
  }

  /**
   *
   */
  compareDinnerDays () {
    this.changeNumbersToDays()

    for (const dinner of this.dinners) {
      const dinnerDay = dinner.substring(0, 3)
      for (const day of this.namedDays) {
        if (dinnerDay === day) this.matchedDaysAndDinners.push(dinner)
      }
    }

    this.createObjectWithTime()
  }

