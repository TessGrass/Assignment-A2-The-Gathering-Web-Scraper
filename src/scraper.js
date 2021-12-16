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
export default class Scraper {
  constructor() {
    this.url = ''
  }

  async scraperInit (url) {
    this.url = url
    const getDomData = await this.retrieveLinks()
    console.log(getDomData)
    const domData = new JSDOM(getDomData)

    return domData

   /*  const links = Array.from(domData.window.document.querySelectorAll('a')).map(links => links.href)
    console.log(links)
    
    return [...new Set(links)]
  }*/
  
}
async retrieveLinks () {
  const fetchedData = await fetch(this.url)
  return fetchedData.text()
}
}