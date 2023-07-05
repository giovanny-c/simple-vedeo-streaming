
import * as fs from "fs"
import util from "util"
import stream from "stream"
import path from "path"
import { Router, request as req, response as res } from "express";

const routes = Router()

routes.get("/play", (req, res)=> {

    try {
       
        const indexPath = path.resolve("public/index.html")
        
        res.sendFile(indexPath)
        
        
    } catch (error) {
        res.status(500).send(`${error}`)
    }
})

routes.get("/player1", (req, res)=>{

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

routes.get("/player2", async (req, res) => {
    try {

        const {range} = req.headers

        const videoPath = "videos/video.mp4"


        if(range){
            
            // const fileInfo = util.promisify(fs.stat)
            // const {size} = await fileInfo(videoPath)
            //same as
            const {size} = await fs.promises.stat(videoPath)
            
            let [bStart, bEnd] = range.replace(/bytes=/, "").split("-")
            
            let start = parseInt(bStart, 10)
            let end = bEnd ? parseInt(bEnd, 10) : size - 1
            
            if(!isNaN(start) && isNaN(end)){
                start = start
                end = size - 1
            }
            
            if(isNaN(start) && !isNaN(end)){
                start = size - end
                end = size - 1
            }
            
            if(start >= size || end >= size){

                res.writeHead(416, {
                    "Content-Range": `bytes */${size}`
                })//range not satisfiable
                
                return res.end()
                
            }
            
            // console.log(`
            // size: ${size}, 
            // range: ${range}
            //     `)
            
            //     console.log("2")
            
            
            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${size}`,
                "Accept_Ranges": "bytes",
                "Content-length": end - start + 1,
                "Content-Type": "video/mp4", 
            })
            
            // const readable = new stream.Readable(videoPath)
            let readable = fs.createReadStream(videoPath, {start, end})
            
            //same as 
            readable.pipe(res, {end: true})
            // stream.pipeline(readable, res, err => {
                //     console.log(err)
                // })
            
        }
            
    } catch (error) {
        console.error(error)
    }
})
    
export{routes}