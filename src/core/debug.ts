import _debug from 'debug'
import { NAME } from './constants'

export default {
  plugin: _debug(`${NAME}:plugin`),
  loader: _debug(`${NAME}:loader`),
}
