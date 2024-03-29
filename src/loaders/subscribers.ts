import { glob } from 'glob';

import path from "path"
import { asFunction } from "awilix"
import { MedusaContainer } from "@medusajs/medusa"

/**
 * Registers all subscribers in the subscribers directory
 */
export default ({ container }: { container: MedusaContainer }) => {

  const corePath ="../subscribers/*.js"
  const coreFull = path.join(__dirname, corePath)

  const core = glob.sync(coreFull, { cwd: __dirname })
  core.forEach((fn:any) => {
    const loaded = require(fn).default

    container.build(asFunction((cradle) => new loaded(cradle)).singleton())
  })
}
