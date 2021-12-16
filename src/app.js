/**
 * The application module.
 *
 * @author Therese Grass <tg222kv@student.lnu.se>
 * @version 1.1.0
 */
import { CompileData } from './CompileData.js'

try {
  // Parse the command-line (skip the first two arguments).
  const [,, url] = process.argv
  console.log(url)
  // Begin to run the actual application.
  const compileData = new CompileData(url)
  await compileData.run()

} catch (error) {
  console.error(error.message)
}