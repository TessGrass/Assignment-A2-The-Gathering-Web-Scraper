/**
 * The Scraper module.
 *
 * @author Therese Grass <tg222kv@student.lnu.se>
 * @version 1.1.0
 */

import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'

/**
 *
 */
export default class Scraper {
  /**
   *
   */
  constructor () {
    this.url = ''
  }

  /**
   * @param url
   */
  async runScraper (url) {
    this.url = url
    const getDomData = await this.retrieveLinks()
    const domData = new JSDOM(getDomData)

    return domData
  }

  /**
   *
   */
  async retrieveLinks () {
    const fetchedData = await fetch(this.url)
    return fetchedData.text()
  }
}
