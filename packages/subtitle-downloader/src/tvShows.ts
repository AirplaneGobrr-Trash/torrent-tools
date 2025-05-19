import axios from 'axios';
import * as cherio from 'cheerio';
import * as types from './types';

// https://www.moviesubtitles.org/
// https://www.tvsubtitles.net/

let flagReg = /\/([a-zA-Z]+)\.gif/

const tvCache: any = {}
const episodeCache: any = {}

// This is used to find the show on tvsubtitles.net
export async function search(query: string, fixInput: Boolean = true): Promise<types.TV_SearchResult[]> {
    try {
        if (fixInput) query = query.match(/([a-zA-Z ]*)/)?.[1] || query;

        const response = await axios.post("https://www.tvsubtitles.net/search.php", {
            qs: query.split(" ").join("+")
        }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        const $ = cherio.load(response.data);
        const tvShowLinks: types.TV_SearchResult[] = [];

        $('div[style=""] a[href]').each((index, elementRaw) => {
            const element = $(elementRaw)
            const href: string = element.attr('href') || "";
            const text: string = element.text();
            if (text.toLowerCase().includes(query.toLowerCase())) {
                const idMatch: string[] = href.match(/tvshow-(\d+)\.html/) || [];
                const flagsElm = element.parent().find("img")

                if (idMatch) {

                    let langs: string[] = []
                    flagsElm.each((i, el) => {
                        let lang = ($(el).attr("src") || "").match(flagReg)?.[1]
                        if (lang) langs.push(lang)
                    })

                    tvShowLinks.push({
                        name: text,
                        id: Number(idMatch[1]),
                        langs: langs
                    });
                }
            }
        });

        return tvShowLinks;
    } catch (error) {
        console.error('Search failed:', error.message);
        return [];
    }
}

async function getSeasonPage(tvShow: types.TV_SearchResult, season: Number): Promise<cherio.CheerioAPI> {
    try {
        let id = `${tvShow.id}-${season}`;
        let $: cherio.CheerioAPI = cherio.load(tvCache[id] || "");

        if (!tvCache[id]) {
            const response = await axios.post(`https://www.tvsubtitles.net/tvshow-${id}.html`);
            $ = cherio.load(response.data);
            tvCache[id] = $
        }

        return $
    } catch (e) {
        return cherio.load("");
    }
}

async function getEpisodePage(episode: types.EpisodeInfo): Promise<cherio.CheerioAPI> {
    try {
        let id = `${episode.id}`;
        let $: cherio.CheerioAPI = cherio.load(episodeCache[id] || "");

        if (!episodeCache[id]) {
            const response = await axios.post(`https://www.tvsubtitles.net/episode-${id}.html`);
            $ = cherio.load(response.data);
            episodeCache[id] = $
        }

        return $
    } catch (e) {
        return cherio.load("");
    }
}

export async function getSeasons(tvShow: types.TV_SearchResult) {
    // https://www.tvsubtitles.net/tvshow-510-1.html

    try {
        let season: Number = 1;
        let $ = await getSeasonPage(tvShow, season);

        // The biggest season should be the first a element but you never know!
        $("p[class=description] a").each((_, el) => {
            let seasonT: Number = Number($(el).attr("href")?.match(/tvshow-\d*-(\d+).html/)?.[1] || 0)
            if (seasonT > season) season = seasonT;
        })
        return season
    } catch (e) {
        return 0;
    }
}

export async function getEpisodes(tvShow: types.TV_SearchResult, season: Number): Promise<types.EpisodeInfo[]> {
    try {
        let $ = await getSeasonPage(tvShow, season);

        let epInfo: types.EpisodeInfo[] = []

        $("#table5 tbody tr").each((i, v) => {
            let cols = $(v).find("td")
            if (cols.length == 4) {

                let [_, s, e]: Array<Number> = ($(cols[0]).text().match(/(\d+)x(\d+)/) || []).map(Number);

                let nameRow = $(cols[1])
                let name: string = nameRow.text();
                let nameID = Number(nameRow.find("a").attr("href")?.match(/episode-(\d+).html/)?.[1] || 0)

                let count: Number = Number($(cols[2]).text() || 0);

                let flags: Array<string> = []

                $(cols[3]).each((i, el) => {
                    let imgs = $(el).find("img");
                    imgs.each((_, elel) => {
                        let flag = $(elel);
                        let f = flag.attr("src")?.match(flagReg)?.[1]
                        if (f && f != "blank") flags.push(f)
                    })
                })

                if (nameID) {
                    epInfo.push({
                        name: name,
                        episode: e,
                        season: s,
                        subtitleCount: count,
                        langs: flags,
                        id: nameID
                    })
                }
            }
        })
        return epInfo;
    } catch (e) {
        throw new Error("oh no!")
    }
}


export async function getSubtitles(episode: types.EpisodeInfo): Promise<types.SubtitleFileInfo[]> {
    try {
        let $ = await getEpisodePage(episode);

        let toSend: types.SubtitleFileInfo[] = []

        let subtitles = $("div[class=\"subtitlen\"]")
        subtitles.each((i, el) => {
            let element = $(el)
            let redVotes = Number(element.find("span[style=\"color:red\"]").text().trim() || 0)
            let greenVotes = Number(element.find("span[style=\"color:green\"]").text().trim() || 0)

            let nameElm = element.find("h5")
            let name: string = nameElm.text().trim()
            let lang: string = (nameElm.find("img").attr("src")?.match(flagReg)?.[1] || "")
            let rip: string = element.find("p[alt=\"rip\"]").text().trim()
            let release: string = element.find("p[alt=\"release\"]").text().trim()
            let author: string = element.find("p[alt=\"author\"]").text().trim()
            let downloads: Number = Number(element.find("p[alt=\"downloaded\"]").text().trim() || 0)

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
                id: Number(subtitles.parent().attr("href")?.match(/subtitle-(\d+)\.html/)?.[1] || 0)
            })
        })

        return toSend
    } catch (e) {
        console.log(e)
        throw new Error("Oh no!")
    }
}