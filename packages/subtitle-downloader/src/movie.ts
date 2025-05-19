// no code, yet.
import axios from 'axios';
import * as cherio from 'cheerio';
import * as types from './types';

let flagReg = /\/([a-zA-Z]+)\.gif/

export async function search(query: string, fixInput: Boolean = true): Promise<types.MovieSearchResult[]> {
    try {
        if (fixInput) query = query.match(/([a-zA-Z ]*)/)?.[1] || query;

        const response = await axios.post("https://www.moviesubtitles.org/search.php", {
            q: query.split(" ").join("+")
        }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            validateStatus: ()=> true
        });

        const $ = cherio.load(response.data);
        const movies: types.MovieSearchResult[] = []

        $("li div a[href]").each((i, el)=>{
            let element = $(el);

            let name: string = element.text() || "";
            let id = Number(element.attr("href").match(/movie-(\d+)\.html/)?.[1] || 0 );

            if (name.toLowerCase().includes(query.toLowerCase()) && id != 0) {
                movies.push({
                    id: id,
                    name: name
                });
            }

            
        })
        return movies;
    } catch (e) {
        console.log(e)
        return;
    }
}

export async function getSubtitles(movie: types.EpisodeInfo): Promise<types.SubtitleFileInfo[]> {
    try {
        const response = await axios.get(`https://www.moviesubtitles.org/movie-${movie.id}.html`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            validateStatus: ()=> true
        });

        const $ = cherio.load(response.data);

        let toSend: types.SubtitleFileInfo[] = []

        let subtitles = $("div[class=\"subtitle\"]")
        subtitles.each((i, el) => {
            let element = $(el)
            let redVotes = Number(element.find("span[style=\"color:red\"]").text().trim() || 0)
            let greenVotes = Number(element.find("span[style=\"color:green\"]").text().trim() || 0)

            let nameElm = element.find("b")
            let name: string = nameElm.text().trim()
            let lang: string = (element.find("img").attr("src")?.match(flagReg)?.[1] || "")
            let rip: string = element.find("td[title=\"Rip\"]").text().trim()
            let release: string = element.find("td[title=\"release\"]").text().trim()
            let author: string = "" // No author
            let downloads: Number = Number(element.find("td[title=\"downloaded\"]").text().trim() || 0)

            toSend.push({
                bad: redVotes,
                good: greenVotes,
                ratio: greenVotes - redVotes,
                name: name,
                lang: lang,
                rip: rip,
                release: release,
                author: author,
                downloads: downloads,
                id: Number(element.find("a").attr("href")?.match(/subtitle-(\d+)\.html/)?.[1] || 0)
            })
        })

        return toSend
    } catch (e) {
        console.log(e)
        throw new Error("Oh no!")
    }
}

export async function downloadSubtitle(subtitle: types.SubtitleFileInfo) {
    try {
        // 

        const response = await axios.get(`https://www.moviesubtitles.org/download-${subtitle.id}.html`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            validateStatus: ()=> true
        });
    } catch (e) {

    }
}