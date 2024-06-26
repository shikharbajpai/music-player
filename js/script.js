let currentSong = new Audio();
let songs = [];
let currentFolder = '';

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder;
    let response = await fetch(`/${folder}.json`); // Fetching from JSON file
    let fetchedSongs = await response.json(); // Parsing JSON data
    // show all the songs in the library
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of fetchedSongs) {
        songUl.innerHTML = songUl.innerHTML +
            `<li>
                <img src="svgImages/music.svg" class="invert" width="34" alt="Music icon">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Anonymous</div>
                </div>
                <div class="playnow">
                    <img src="svgImages/play.svg" class="invert" alt="Play Button">
                </div>
            </li>`;
    }
    // Add a click event listener to each song from library
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return fetchedSongs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "svgImages/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let response = await fetch(`/songs.json`); // Fetching albums from JSON file
    let albums = await response.json(); // Parsing JSON data
    let cardContainer = document.querySelector(".cardContainer");

    // Clear the card container before appending new cards
    cardContainer.innerHTML = "";

    // Loop through each album in the JSON data
    for (let folderName of albums) {
        // get the meta data of the folder
        let response = await fetch(`/${folderName}/info.json`); // Fetching album info from JSON file
        let albumInfo = await response.json(); // Parsing JSON data
        let title = albumInfo.title;
        let description = albumInfo.description;

        const titleMaxLength = 16;
        const descriptionMaxLength = 40;

        if (title.length > titleMaxLength) {
            title = title.substring(0, titleMaxLength) + "...";
        }
        if (description.length > descriptionMaxLength) {
            description = description.substring(0, descriptionMaxLength) + "...";
        }
        cardContainer.innerHTML += `<div class="card" data-folder="${folderName}">
            <div class="play">
                <img src="svgImages/play.svg" alt="play icon">
            </div>
            <img src="/${folderName}/cover.jpg" alt="cover image">
            <div class="cardtext">
                <p class="textheading">${title}</p>
                <p class="subheading">${description}</p>
            </div>
        </div>`;
    }

    // Add click event listener to card
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            let folderName = item.currentTarget.dataset.folder;
            songs = await getSongs(`${folderName}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {

    // Get the list of all songs from the JSON file
    songs = await getSongs("freemusic");
    playMusic(songs[0], true);

    // Displaying all the albums on the cardContainer
    displayAlbums();

    // Add a click event listener to songbuttons id play
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "svgImages/pause.svg";
        } else {
            currentSong.pause();
            play.src = "svgImages/play.svg";
        }
    });

    // Add a click event listener to songbuttons id previous
    previous.addEventListener("click", () => {
        currentSong.pause();
        play.src = "svgImages/play.svg";
        const parts = currentSong.src.split("/");
        const filename = parts[parts.length - 1];
        const index = songs.indexOf(filename);
        const previousSongIndex = index - 1;
        if (previousSongIndex >= 0) {
            playMusic(songs[previousSongIndex]);
        }
        else if (previousSongIndex === 0) {
            currentSong.play();
            play.src = "svgImages/pause.svg";
        }
    });

    // Add a click event listener to songbuttons id next
    next.addEventListener("click", () => {
        currentSong.pause();
        play.src = "svgImages/play.svg";
        const parts = currentSong.src.split("/");
        const filename = parts[parts.length - 1];
        const index = songs.indexOf(filename);
        const nextSongIndex = index + 1;
        if (nextSongIndex < songs.length) {
            playMusic(songs[nextSongIndex]);
        }
        else if (nextSongIndex === songs.length) {
            currentSong.play();
            play.src = "svgImages/pause.svg";
        }
    });

    // Add a timeupdate event listener to currentSong 
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add a click event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Add a click event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add a click event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Add a change event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("svgImages/mute.svg", "svgImages/volume.svg");
        } else if (currentSong.volume === 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("svgImages/volume.svg", "svgImages/mute.svg");
        }
    });

    // Add a click event listener to mute
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("svgImages/volume.svg")) {
            e.target.src = e.target.src.replace("svgImages/volume.svg", "svgImages/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("svgImages/mute.svg", "svgImages/volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });

    // Add a click event listener to searchButton
    document.getElementById("searchButton").addEventListener("click", () => {
        let searchTerm = document.getElementById("searchInput").value.toLowerCase();
        if (searchTerm.trim() !== "") {
            let filteredSongs = songs.filter(song => song.toLowerCase().includes(searchTerm));
            displaySearchResults(filteredSongs);
        } else {
            // If search term is empty, display all songs
            displaySearchResults(songs);
        }
    });

    function displaySearchResults(results) {
        let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUl.innerHTML = ""; // Clear existing list
        for (const song of results) {
            let songName = song.replace(".mp3", "");
            songUl.innerHTML += `<li>
                <img src="svgImages/music.svg" class="invert" width="34" alt="Music icon">
                <div class="info">
                    <div>${songName.replaceAll("%20", " ")}</div>
                    <div>Anonymous</div>
                </div>
                <div class="playnow">
                    <img src="svgImages/play.svg" class="invert" alt="Play Button">
                </div>
            </li>`;
        }

        // Add click event listener to new list items
        Array.from(songUl.getElementsByTagName("li")).forEach((e) => {
            e.addEventListener("click", () => {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            });
        });
    }

    // Add click event listener to search
    document.querySelector(".search").addEventListener("click", () => {
        document.querySelector(".search-container").style.display = "flex";
    });

}

main();

