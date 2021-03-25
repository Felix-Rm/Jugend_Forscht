async function loadJson(filepath) {
    let req = await fetch(filepath)
    if (req.ok)
        return (await req.json())

    return null
}


let active_media = 0
let data

window.onload = start
window.onresize = resize

async function start() {
    resize()

    let wrapper = document.getElementById('wrapper')
    data = await loadJson("media/data.json")

    console.log(data)

    for (let file in data) {
        let elt = document.createElement('div')
        elt.className = "media right"

        let title = document.createElement('p')
        title.innerText = data[file]

        let media

        if (file.endsWith('mp4')) {
            media = document.createElement('video')
            media.controls = true
        } else {
            media = document.createElement('img')
        }

        media.src = 'media/' + file

        elt.appendChild(media)
        elt.appendChild(title)
        wrapper.appendChild(elt)
    }

    document.getElementById('to_left').onclick = () => {
        if (active_media > 0) active_media--
        openCurrentMedia()
    }

    document.getElementById('to_right').onclick = () => {
        if (active_media < Object.keys(data).length - 1) active_media++
        openCurrentMedia()
    }

    openCurrentMedia()

    setTimeout(() => {
        for (let elt of document.getElementsByClassName('media'))
            elt.classList.add("animate")
    }, 100)
}

function openCurrentMedia() {
    let media = document.getElementsByClassName('media')

    for (let i = 0; i < media.length; i++) {
        media[i].style.left = (50 - 100 * (active_media - i)) + '%'
        media[i].style.width = i == active_media ? "100%" : "90%"
        media[i].style.height = i == active_media ? "100%" : "90%"

        media[i].style.display = (Math.abs(active_media - i) > 2) ? 'none' : 'block'
    }
}

function resize() {
    //setup formatting of main wrapper
    let main_wrapper = document.getElementById('wrapper')
    presentation_aspect = 16 / 9

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
}