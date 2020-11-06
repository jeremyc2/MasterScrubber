var input,
    isLoading = true,
    progress,
    video,
    frames,
    framesProgressBar,
    playbackSpeedSlider,
    toggleControlsButton,
    toggleFramesButton,
    downloadFrameButton,
    canvas,
    context,
    thumbnails = [];

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
            toggleControls();
            e.preventDefault();
        }
    }
    if(e.code == "KeyL") {
        document.body.classList.toggle("light");
        e.preventDefault();
    }
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

function toggleControls() {
    if (video.hasAttribute("controls")) {
        video.removeAttribute("controls"); 
    } else {
        video.setAttribute("controls","controls");  
    }
}

function toggleFrames() {
    if(frames.classList.contains("visible")) {
        framesOff();
    } else {
        frames.classList.add("visible");
        focusCurrentFrame();
    }
}
function framesOff() {
    frames.classList.remove("visible");
}

function focusCurrentFrame(){
    var frameNumber = Math.floor(video.currentTime / 5);
    document.querySelector(`#thumbnail${frameNumber}`).focus();
    frames.scrollTop = Math.floor(frameNumber / 3) * 
                document.querySelector("#thumbnail0").getBoundingClientRect().height;
}

this.addEventListener("DOMContentLoaded", () => {
    input = document.querySelector('input');
    progress = document.querySelector('progress');
    video = document.getElementById("vid");
    frames = document.getElementById("frames");
    playbackSpeedSlider = document.getElementById("playbackSpeed");
    toggleControlsButton = document.getElementById("toggleControls");
    toggleFramesButton = document.getElementById("toggleFrames");
    downloadFrameButton = document.getElementById("downloadFrame");
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');

    var i;

    input.addEventListener('change', function() {

        i = 0;

        toggleControlsButton.disabled = true;
        toggleFramesButton.disabled = true;
        downloadFrameButton.disabled = true;

        framesOff();
        frames.innerHTML = "";
        thumbnails = [];
        video.classList.remove("visible");

        video.src = URL.createObjectURL(this.files[0]);
    });

    playbackSpeedSlider.addEventListener('input', function() {
        video.playbackRate = this.value;
    });

    document.addEventListener('keydown', keyListener);

    toggleControlsButton.addEventListener("click", toggleControls);
    toggleFramesButton.addEventListener("click", toggleFrames);
    downloadFrameButton.addEventListener("click", downloadCurrentFrame);

    video.addEventListener('loadedmetadata', function() {
        progress.classList.add("visible");
        this.currentTime = i;
        canvas.width = this.videoWidth;
        canvas.height = this.videoHeight;

        this.addEventListener("timeupdate", onTimeUpdate);
        this.addEventListener("seeked", generateThumbnail);

    });

    frames.addEventListener("scroll", function() {
        framesProgressBar.style.width = frames.getBoundingClientRect().width * 
            (this.scrollTop / this.scrollHeight);
    });

    function onTimeUpdate() {

        if(isLoading) {
            var percent = (video.currentTime / video.duration) * 100;
            progress.value = percent;
        } else{
            focusCurrentFrame();
        }

    }

    function updateVideoTime(index) {
        video.currentTime = index * 5;
    }

    video.addEventListener("seeked", generateThumbnail);

    function generateThumbnail() {
        context.drawImage(video, 0, 0);
        canvas.toBlob(blob => {
            thumbnails.push(URL.createObjectURL(blob));

            // when frame is captured increase, here by 5 seconds
            i += 5;

            // if we are not passed end, seek to next interval
            if (i <= this.duration) {
                // this will trigger another seeked event
                this.currentTime = i;
            }
            else {
                // Done!, next action
                progress.classList.remove("visible");

                isLoading = false;

                video.removeEventListener("seeked", generateThumbnail);

                this.currentTime = 0;

                // Generate Thumbnails
                var index = 0;
                thumbnails.forEach(thumbnailSrc => {
                    var thumbnail = document.createElement("img");
                    thumbnail.setAttribute("data-index", index);
                    thumbnail.setAttribute("tabindex", -1);
                    thumbnail.id = `thumbnail${index++}`;
                    thumbnail.src = thumbnailSrc;

                    thumbnail.addEventListener("click", function() {
                        updateVideoTime(parseInt(this.getAttribute("data-index")));
                        frames.classList.remove("visible");
                    });

                    frames.appendChild(thumbnail);
                });

                framesProgressBar = document.createElement("div");
                framesProgressBar.id = "frames-progress";
                frames.appendChild(framesProgressBar);

                video.classList.add("visible");

                toggleControlsButton.disabled = false;
                toggleFramesButton.disabled = false;
                downloadFrameButton.disabled = false;

            }

        }, 'image/jpeg');
    }

});
