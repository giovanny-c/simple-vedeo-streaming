
import * as fs from "fs"
import path from "path"
import { Router, request as req, response as res } from "express";

const routes = Router()

routes.get("/", (req, res)=> {

    try {
       
        const indexPath = path.resolve("public/index.html")
        
        res.sendFile(indexPath)
        
        
    } catch (error) {
        res.status(500).send(`${error}`)
    }
})

routes.get("/video", (req, res)=>{

    try {
        
        const range = req.headers.range

        if(!range){
            res.status(400).send("Requires a range header")
        }

        const videoPath = "videos/video.mp4"

        const videoSize = fs.statSync(videoPath).size

        const CHUNK_SIZE = 10 ** 6 //1MB

        const start = Number(range.replace(/\D/g, ""))

        const end = Math.min(start + CHUNK_SIZE, videoSize - 1)

        const contentLength = end - start + 1

        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-length": contentLength,
            "Content-Type": "video/mp4", 
        }

        res.writeHead(206, headers) //partial content

        //criando a stream de leitura com o range
        const videoStream = fs.createReadStream(videoPath, {start, end})

        //enviando para o cliente atraves de uma writable stream (res)
        videoStream.pipe(res)


    } catch (error) {
            res.status(500).send(error)
    }

})

export{routes}