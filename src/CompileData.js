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
  }

  async run () {

    const data = await this.scraper.scraperInit(this.url)
    const links = Array.from(data.window.document.querySelectorAll('a')).map(links => links.href)
    console.log(links)
    
    return [...new Set(links)]
  }  
}