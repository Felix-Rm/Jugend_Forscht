let header, video1_player, video2_player, main_wrapper, point_wrapper, info_wrapper, path_line
let state = undefined//JSON.parse(localStorage.getItem('state'))

if (!state)
    state = {
        path: "Prototyp 2"
    }


setInterval(safePath, 500)

function handleError() {
    console.log("error", state)
    state.path = "Prototyp 2"
    safePath()
    location.reload()
}


function safePath() {
    localStorage.setItem('state', JSON.stringify(state))
}

window.onload = start
window.onresize = start

function start() {
    header = document.getElementById('header')
    main_wrapper = document.getElementById('main')
    video1_player = document.getElementById('video1')
    video2_player = document.getElementById('video2')
    point_wrapper = document.getElementById('points')
    info_wrapper = document.getElementById('info')
    path_line = document.getElementById('current_path')

    const presentation_aspect = 21 / 9
    const video_aspect = 3200 / 2000

    const padding = 25
    const r_height = window.innerHeight - header.offsetHeight
    const r_width = window.innerWidth
    const p_height = r_height - 2 * padding
    const p_width = r_width - 2 * padding

    let width, height, top, left

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

    point_wrapper.style.width = height * video_aspect + 'px'
    info_wrapper.style.left = height * video_aspect + 'px'

    open()
}


async function loadJson(filepath) {
    let req = await fetch(filepath)
    if (req.ok)
        return (await req.json())
    else
        handleError()

}


async function open() {
    path_line.innerHTML = state.path

    const vp = state.path.split('/').length % 2 == 0 ? video1_player : video2_player
    const nvp = state.path.split('/').length % 2 == 0 ? video2_player : video1_player
    vp.oncanplay = null
    vp.onerror = null
    vp.onended = null

    vp.className = "active"
    nvp.className = "inactive"

    vp.src = state.path + "/intro.mp4"
    data = await loadJson(state.path + "/points.json")

    info_wrapper.innerHTML = data['info'].join(' ')

    point_wrapper.classList.add('hidden')
    point_wrapper.innerHTML = ""
    for (let entry of data['points']) {
        let elt = document.createElement('div')
        elt.className = 'point'
        elt.style.left = entry.pos[0] + '%'
        elt.style.top = entry.pos[1] + '%'
        elt.innerHTML += `
            <h1>${entry.title}</h1>
            <i class="material-icons">add</i>
        `
        elt.onclick = () => {
            state.path += '/' + entry.name
            open()
        }

        point_wrapper.appendChild(elt)
    }

    vp.oncanplay = vp.play
    vp.play()
    vp.onerror = handleError

    vp.onended = () => {
        point_wrapper.classList.remove('hidden')
    }

}