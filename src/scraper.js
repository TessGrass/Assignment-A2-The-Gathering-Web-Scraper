/**
 * The Scraper module.
 *
 * @author Therese Grass <tg222kv@student.lnu.se>
 * @version 1.1.0
 */

import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'

/**
 * Representing a web scraper.
 */
export class Scraper {
  /**
   * Creates an instance of the current type.
   *
   */
  constructor () {
    this.url = ''
  }

  /**
   * Scrapes a specific url.
   *
   * @param {string} url - representing a specific url.
   * @returns {object} - returns the dom data.
   */
  async runScraper (url) {
    this.url = url
    const getDomData = await this.retrieveLinks()
    const domData = new JSDOM(getDomData)
    return domData
  }

  /**
   * Retrieves the data from a specific url.
   *
   * @returns {object} - returns the dom tree.
   */
  async retrieveLinks () {
    const fetchedData = await fetch(this.url)
    return fetchedData.text()
  }
}
