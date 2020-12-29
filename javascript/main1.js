var input, progress, video, tempVideo, frames, playbackSpeedSlider, speedTooltip, 
    openSettingsButton, toggleFramesButton, downloadFrameButton, 
    settingsModal, themeCheckbox, videoControlsCheckbox,
    canvas, context, framesProgressBar;

document.addEventListener("DOMContentLoaded", () => {
    findElements();

    // When the user clicks anywhere outside of the modal, close it
    document.addEventListener("click", function(event) {
        if (event.target == settingsModal) {
            toggleSettings();
        }
    });

    playbackSpeedSlider.addEventListener('input', function() {
        speedTooltip.innerText = `${this.value}x`;
        video.playbackRate = this.value;
    });

    videoControlsCheckbox.addEventListener("change", function() {
        if (!this.checked) {
            video.removeAttribute("controls"); 
        } else {
            video.setAttribute("controls","controls");  
        }
    });

    themeCheckbox.addEventListener("change", function() {
        document.body.classList.toggle("light");
    });

    document.addEventListener('keydown', keyListener);

    openSettingsButton.addEventListener("click", toggleSettings);
    toggleFramesButton.addEventListener("click", toggleFrames);
    downloadFrameButton.addEventListener("click", downloadCurrentFrame);

    frames.addEventListener("scroll", function() {
        framesProgressBar.style.width = frames.getBoundingClientRect().width * 
            (this.scrollTop / this.scrollHeight) * 1.06;
    });

    video.addEventListener("timeupdate", focusCurrentFrame);

});

function keyListener(e) {
    if(!isLoading) {
        if(e.code == "KeyF") {
            toggleFrames();
            e.preventDefault();
        }
        else if(e.code == "KeyD") {
            downloadCurrentFrame();
            e.preventDefault();
        }
        else if(e.code == "KeyC") {
            videoControlsCheckbox.checked ^= true;
            if (video.hasAttribute("controls")) {
                video.removeAttribute("controls"); 
            } else {
                video.setAttribute("controls","controls");  
            }
            e.preventDefault();
        }
    }
    if(e.code == "KeyT") {
        themeCheckbox.checked ^= true;
        document.body.classList.toggle("light");
        e.preventDefault();
    }
    else if(e.code == "KeyS") {
        toggleSettings();
        e.preventDefault();
    }
}

function toggleSettings() {
    if(settingsModal.style.display != "block") {
        openSettingsButton.classList.add("on");
        animateCSS(settingsModal.querySelector(".modal-content"), "backInUp");
        settingsModal.style.display = "block";
    }
    else {
        openSettingsButton.classList.remove("on");
        animateCSS(settingsModal.querySelector(".modal-content"), "backOutDown", 
            () => settingsModal.style.display = "none");
    }
}

function toggleFrames() {
    if(frames.classList.contains("visible")) {
        framesOff();
    } else {
        toggleFramesButton.classList.add("on");
        frames.classList.add("visible");
        focusCurrentFrame();
    }
}

function framesOff() {
    frames.classList.remove("visible");
    toggleFramesButton.classList.remove("on");
}

function focusCurrentFrame(){
    var frameNumber = Math.floor(video.currentTime / 5);
    document.querySelector(`#thumbnail${frameNumber}`).focus();
    frames.scrollTop = Math.floor(frameNumber / 3) * 
                document.querySelector("#thumbnail0").getBoundingClientRect().height;
}

function downloadCurrentFrame() {
    context.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
        var a = document.getElementById("download");
        var link = URL.createObjectURL(blob);
        a.href = link;
        a.click();
    });
}

function updateVideoTime(index) {
    video.currentTime = index * 5;
}

function findElements(){
    input = document.querySelector('input');
    progress = document.querySelector('progress');
    video = document.getElementById("vid");
    tempVideo = document.getElementById("temp-vid");
    frames = document.getElementById("frames");
    playbackSpeedSlider = document.getElementById("playbackSpeed");
    speedTooltip = document.getElementById("speed-tooltip");
    openSettingsButton = document.getElementById("openSettings");
    toggleFramesButton = document.getElementById("toggleFrames");
    downloadFrameButton = document.getElementById("downloadFrame");
    settingsModal = document.getElementById("settings-modal");
    themeCheckbox = document.getElementById("dark-theme");
    videoControlsCheckbox = document.getElementById("show-video-controls");
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
}