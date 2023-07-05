
import "reflect-metadata"

import Express from "express"

import { routes } from "../routes/routes"

const app = Express()


app.use(routes)


app.listen( 3333, () => {
    console.log("Server listening on port 3333")
})
