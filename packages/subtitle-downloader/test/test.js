const e = require("../dist/index.js")

e.movie.search("(Spirited Away").then(async (v)=>{
    console.log(v)

    let help = await e.movie.getSubtitles(v[0])
    console.log(help)
})