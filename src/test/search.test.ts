import YouTubeHelper from "../base/classes/SpiderPlayer/YoutubeHelper";


async function test() {
    const YouTube = YouTubeHelper;
    // const video = await YouTube.getVideoInfo("https://www.youtube.com/watch?v=2Vv-BfVoq4g");
    // console.log(video);

    // const playlist = await YouTube.getPlaylistInfo("https://www.youtube.com/watch?v=AhZvCgk1Ay4&list=PLZwbZLSR-ORYgWXLZfs3Qku6xt3iGgYgv&index=5");
    // console.log(playlist);

    const search = await YouTube.searchVideos("Never gonna give you up");
    console.log(search);
}

test();