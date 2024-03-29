/**
 * The CompileData module.
 *
 * @author Therese Grass <tg222kv@student.lnu.se>
 * @version 1.1.0
 */

import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'
import Scraper from './scraper.js'

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
    const links = await this.retrieveData('a', 'href')
    this.checkRetriveData(links, 'links')
    this.links = [...new Set(links)]
    this.checkCalendar()
  }

  /**
   * Gets data from scraper from a given url.
   *
   * @param {string} tag - the recieved argument.
   * @param {string} value - the recieved argument.
   * @returns {Array} - Returns an array of a string with the values found in the parameter.
   */
  async retrieveData (tag, value) {
    const data = await this.scraper.runScraper(this.url)
    return Array.from(data.window.document.querySelectorAll(tag)).map(links => links[value])
  }

  /**
   * Checks if the parameter data contains JSDOM data. If not, throw an error.
   *
   * @param {object} data  - the received argument.
   * @param {string} string - the received argument.
   */
  checkRetriveData (data, string) {
    if (data !== undefined) {
      console.log(`Scraping ${string} ...OK`)
    } else {
      throw new Error(`Scraping ${string} ...FAILED`)
    }
  }

  /**
   * Checks each persons calendar to find their spare time.
   */
  async checkCalendar () {
    const object2 = {}
    this.url = this.links[0]
    const calendarUrl = await this.retrieveData('a', 'href')
    this.checkRetriveData(calendarUrl, 'available days')

    await Promise.all(calendarUrl.map(async name => {
      this.url = this.links[0] + name.substring(2, name.length)
      const data = await this.retrieveData('td', 'textContent')
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
      else if (day === 'Saturday') this.weekDay.push('06')
      else if (day === 'Sunday') this.weekDay.push('07')
    })
    this.checkCinema()
  }

  /**
   * Check movie availaibility. If the status is 1 the movie is available.
   */
  async checkCinema () {
    this.url = this.links[1]
    const cinema = await this.scraper.runScraper(this.url)
    this.checkRetriveData(cinema, 'showtimes')
    const cinemaArray = Array.from(cinema.window.document.querySelectorAll('#movie > option'))
      .map(movie => {
        return {
          number: movie.value,
          name: movie.textContent
        }
      })

    for (let movie = 1; movie < cinemaArray.length; movie++) {
      for (let day = 5; day < 8; day++) {
        let checkAvailaibility = await fetch(`${this.orginalUrl}/cinema/check?day=0${day}&movie=0${movie}`)
        checkAvailaibility = await checkAvailaibility.json()

        const result = checkAvailaibility.filter(obj => {
          return obj.status === 1
        })
        this.arrayOfMovies.push(result)
        this.arrayOfMovies = this.arrayOfMovies.flat()

        this.arrayOfMovies.forEach(obj => {
          if (obj.movie === '01') obj.name = cinemaArray[1].name
          else if (obj.movie === '02') obj.name = cinemaArray[2].name
          else if (obj.movie === '03') obj.name = cinemaArray[3].name
        })
      }
    }
    this.compareDaysAndMovies()
  }

  /**
   * Checks which movie/movies that is available on the day found in this.weekDay.
   */
  compareDaysAndMovies () {
    for (const movie of this.arrayOfMovies) {
      for (const day of this.weekDay) {
        if (movie.day === day) this.cinemaResult.push(movie)
      }
    }
    this.checkDinner()
  }

  /**
   * Check for available dinner times.
   */
  async checkDinner () {
    let dom
    // COOKIE CODE CREDIT: Teaching Assistants.
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
      this.checkRetriveData(dinnerDom, 'possible reservations')
      this.dinners = Array.from(dinnerDom.window.document.querySelectorAll('input'))
        .map(input => input.value)
      this.dinners.pop()
    })
    this.compareDinnerDays()
  }

  /**
   * Checks which day/days that matches the day/days in this.namedDays.
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

  /**
   * Assign the number with the name of the day it's representing.
   */
  changeNumbersToDays () {
    for (const day of this.weekDay) {
      const dayName = this.changeDayToShortWord(day)
      this.namedDays.push(dayName)
    }
  }

  /**
   * Creates an object with the available day and time.
   */
  createObjectWithTime () {
    for (const dinner of this.matchedDaysAndDinners) {
      const day = dinner.substring(0, 3)
      let time = dinner.substring(3, 7)
      time = `${time.substring(0, 2)}:00-${time.substring(2, 4)}:00`
      const object = {
        day: day,
        time: time
      }
      this.dinnerObject.push(object)
    }
    this.createBooking()
  }

  /**
   * Compare day with movie time and create suggestions.
   */
  createBooking () {
    const suggestions = []

    for (const movie of this.cinemaResult) {
      movie.day = this.changeDayToShortWord(movie.day)
      for (const dinner of this.dinnerObject) {
        if (movie.day === dinner.day && parseInt(movie.time.substring(0, 2)) === parseInt(dinner.time.substring(0, 2)) - 2) {
          const object = {
            day: dinner.day,
            cinemaTime: movie.time,
            dinner: dinner.time,
            movie: movie.name
          }
          suggestions.push(object)
        }
      }
    }
    this.bookingOutput(suggestions)
  }

  /**
   * Check and compare the day that is passed in as an argument.
   *
   * @param {string} day - the day that's going to be compared.
   * @returns {string} - returns the matched day.
   */
  changeDayToShortWord (day) {
    let result = ''
    if (day === '05') result = 'fri'
    else if (day === '06') result = 'sat'
    else if (day === '07') result = 'sun'
    return result
  }

  /**
   * Check and compare the day that is passed in as an argument.
   *
   * @param {string} day - the day that's going to be compared.
   * @returns {string} - returns the result that matched the argument.
   */
  changeDayToWeekDayWord (day) {
    let result = ''
    if (day === 'fri') result = 'Friday'
    else if (day === 'sat') result = 'Saturday'
    else if (day === 'sun') result = 'Sunday'
    return result
  }

  /**
   * Prints out booking suggestion.
   *
   * @param {object} suggestion - represention one, or more, booking suggestion.
   */
  bookingOutput (suggestion) {
    const output = suggestion.map(obj => {
      obj.day = this.changeDayToWeekDayWord(obj.day)
      return `* On ${obj.day}, "${obj.movie}" begins at ${obj.cinemaTime}, and there is a free table to book between ${obj.dinner}`
    })
    console.log('\n' + 'Suggestions' + '\n' + '===========' + '\n' + output.join('\n') + '\n')
  }
}
