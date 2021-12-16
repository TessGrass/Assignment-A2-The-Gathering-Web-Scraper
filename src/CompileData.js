/**
 * The application module.
 *
 * @author Therese Grass <tg222kv@student.lnu.se>
 * @version 1.1.0
 */

 import { JSDOM } from 'jsdom'
 import fetch from 'node-fetch'

/**
 * Encapsulates a Node application.
 */
export class CompileData {
  constructor(url) {
    this.url = url
  }

  async run () {
    const data = await this.extractLinks()
    const domData = new JSDOM(data) //Gör jsonobjekt till html så att querySerlecotr går att använda.

    const links = Array.from(domData.window.document.querySelectorAll('a')).map(links => links.href)
    console.log(links)
    
    return [...new Set(links)]
  }
  async extractLinks () {
    const fetchedData = await fetch(this.url)
    return fetchedData.text()
  }
  
}