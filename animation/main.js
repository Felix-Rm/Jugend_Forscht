let header, main_wrapper, path_line, manual, back_button
let presentation_aspect, video_aspect
let padding, r_height, r_width, p_height, p_width
let height, width


let videos_load_start = 12
let videos_load_end = 0


let animating = false
let origin = "Prototyp_2"


let state = JSON.parse(localStorage.getItem('state'))

if (!state) state = { path: origin }

setInterval(() => localStorage.setItem('state', JSON.stringify(state)), 1000)


window.onerror = handleError

function handleError() {
    console.log("error", state)
    state.path = origin

    alert("Es ist leider ein Fehler aufgetreten!\n\nDie Seite wird nun neu laden um den Fehler zu beheben.")
    location.reload()
}


window.onload = start
window.onresize = resize

async function start() {
    header = document.getElementById('header')
    main_wrapper = document.getElementById('main')
    path_line = document.getElementById('current_path')
    manual = [document.getElementById('manual'), document.getElementById('manual_ok'), document.getElementById('wait_msg')]
    back_button = document.getElementById('back_button')

    // load all frames into dom and activate the root frame
    await load(origin)

    resize()
    setPathLine()
    selectActiveFrame()

    manual[2].innerText = "Die Animationen haben geladen. 'OK' drücken um zu starten!"

    // add event handlers for back_button and manual
    manual[1].onclick = () => {
        manual[0].classList.add('inactive')
        openFrame()
    }

    back_button.onclick = () => {
        if (animating)
            return
        if (state.path.split('/').length == 1)
            return

        let frame = document.getElementById(state.path)
        let intro = frame.getElementsByClassName('intro')[0]
        let outro = frame.getElementsByClassName('outro')[0]
        let points = frame.getElementsByClassName('points')[0]

        points.classList.add('inactive')
        intro.classList.add("inactive")
        outro.classList.remove("inactive")

        animating = true
        outro.currentTime = 0
        outro.play()

        outro.onended = () => {
            animating = false
            let p = state.path.split('/')
            state.path = p.slice(0, p.length - 1).join('/')

            setPathLine()
            let frame = selectActiveFrame()
            let intro = frame.getElementsByClassName("intro")[0]
            let points = frame.getElementsByClassName("points")[0]
            intro.currentTime = intro.duration;
            points.classList.remove('inactive')
        }
    }


}

function resize() {
    //setup formatting of main wrapper
    presentation_aspect = 21 / 9
    video_aspect = 3200 / 2000

    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

    padding = 25
    r_height = vh - header.offsetHeight
    r_width = vw
    p_height = r_height - 2 * padding
    p_width = r_width - 2 * padding

    let top, left

    if (p_width / p_height > presentation_aspect) {
        height = p_height
        width = height * presentation_aspect
        top = header.offsetHeight + padding
        left = (r_width - width) / 2
    } else {
        width = p_width
        height = width / presentation_aspect
        top = header.offsetHeight + (r_height - height) / 2
        left = padding
    }

    main_wrapper.style.top = top + 'px'
    main_wrapper.style.left = left + 'px'
    main_wrapper.style.height = height + 'px'
    main_wrapper.style.width = width + 'px'


    for (let elt of document.querySelectorAll('main .points'))
        elt.style.width = height * video_aspect + 'px'

    for (let elt of document.getElementsByClassName('info')) {
        elt.style.left = height * video_aspect + 'px'
        elt.style.width = width - height * video_aspect + 'px'
    }
}

function videoLoad() {
    videos_load_end++

    manual[2].innerText = `Bitte warten. Die Animationen werden geladen (${parseInt(videos_load_end / videos_load_start * 100)}%). Beim ersten mal Laden kann dies ein paar Sekunden dauern.`

}

function setPathLine() {
    path_line.innerHTML = "Bauelement: " + state.path.replace(/\//g, ' => ')
}

function selectActiveFrame() {
    for (let elt of document.getElementsByClassName('frame')) {
        elt.classList.add('inactive')
    }

    let frame = document.getElementById(state.path)
    frame.classList.remove('inactive')

    let intro = frame.getElementsByClassName('intro')[0]
    let outro = frame.getElementsByClassName('outro')[0]
    intro.classList.remove("inactive")
    outro.classList.add("inactive")
    outro.currentTime = 0
    intro.currentTime = 0

    if (state.path.split('/').length == 1) back_button.classList.add("inactive")
    else back_button.classList.remove("inactive")

    return frame
}

function openFrame() {

    setPathLine()

    let frame = selectActiveFrame()


    let video = frame.getElementsByClassName('intro')[0]
    animating = true

    video.currentTime = 0

    video.play()

    video.onended = () => {
        animating = false
        let points = frame.getElementsByClassName('points')[0]
        points.classList.remove('inactive')
    }
}

async function loadJson(filepath) {
    filepath = window.location.href.replace('index.html', '') + filepath
    try {
        console.log("loading", filepath)
        let req = await fetch(filepath)
        if (req.ok) {
            console.log("loaded", filepath)
            return (await req.json())
        } else {
            console.log("error", filepath)
            handleError()
        }
    } catch (e) {
        console.error(e)
    }
    return null
}

async function loadVideo(filepath) {
    filepath = window.location.href.replace('index.html', '') + filepath
    try {
        console.log("loading", filepath)
        let req = await fetch(filepath)
        if (req.ok) {
            let blob = await req.blob()
            let url = URL.createObjectURL(blob)
            console.log("loaded", filepath, url)
            videoLoad()
            return url
        } else {
            console.log("error", filepath)
            handleError()
        }
    } catch (e) {
        console.error(filepath, e)
    }
    return null
}


async function load(path) {

    data = await loadJson(path + "/points.json")

    let frame = document.createElement("div")
    frame.className = "frame inactive"
    frame.id = path

    let intro = document.createElement("video")
    intro.className = "intro"
    intro.src = await loadVideo(path + '/intro.mp4')
    intro.onerror = handleError


    let outro = document.createElement("video")
    outro.className = "outro inactive"
    outro.src = await loadVideo(path + '/outro.mp4')
    outro.onerror = handleError

    let point_wrapper = document.createElement("div")
    point_wrapper.className = "points inactive"


    let info_wrapper = document.createElement("div")
    info_wrapper.className = "info"
    info_wrapper.innerHTML = data['info'].join(' ')


    for (let entry of data['points']) {

        let elt = document.createElement('div')
        elt.className = 'point' + (entry['name'].length > 0 ? '' : ' hint')
        elt.style.left = entry.pos[0] + '%'
        elt.style.top = entry.pos[1] + '%'
        elt.innerHTML += `
            <h1>${entry.title}</h1>
            <p class="material-icons">add</p>
        `

        if (entry['name'].length > 0)
            elt.onclick = () => {
                if (animating)
                    return
                state.path += '/' + entry.name
                openFrame()
            }

        point_wrapper.appendChild(elt)

        if (entry['name'].length > 0) {
            await load(path + '/' + entry['name'])
        }

    }

    frame.appendChild(intro)
    frame.appendChild(outro)
    frame.appendChild(point_wrapper)
    frame.appendChild(info_wrapper)

    main_wrapper.appendChild(frame)
}