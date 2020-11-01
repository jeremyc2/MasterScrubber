// TODO: Add autoscroll frames
var input,
    progress,
    video,
    frames,
    playbackSpeedSlider,
    toggleControlsButton,
    toggleFramesButton,
    canvas,
    context,
    thumbnails = [];

function keyListener(e) {
    if(e.code == "KeyF") {
        toggleFrames();
        e.preventDefault();
    }
    else if(e.code == "KeyC") {
        toggleControls();
        e.preventDefault();
    }
}

function toggleControls() {
    if (video.hasAttribute("controls")) {
        video.removeAttribute("controls"); 
    } else {
        video.setAttribute("controls","controls");  
    }
}

function toggleFrames() {
    frames.classList.toggle("visible");
}

function framesOn() {
    frames.classList.add("visible");
}

function framesOff() {
    frames.classList.remove("visible");
}

this.addEventListener("DOMContentLoaded", () => {
    input = document.querySelector('input');
    progress = document.querySelector('progress');
    video = document.getElementById("vid");
    frames = document.getElementById("frames");
    playbackSpeedSlider = document.getElementById("playbackSpeed");
    toggleControlsButton = document.getElementById("toggleControls");
    toggleFramesButton = document.getElementById("toggleFrames");
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');

    var i;

    input.addEventListener('change', function() {

        i = 0;

        document.removeEventListener('keydown', keyListener);
        toggleControlsButton.disabled = true;
        toggleFramesButton.disabled = true;

        framesOff();
        frames.innerHTML = "";
        thumbnails = [];
        video.classList.remove("visible");

        video.src = URL.createObjectURL(this.files[0]);
    });

    playbackSpeedSlider.addEventListener('input', function() {
        video.playbackRate = this.value;
    });

    toggleControlsButton.addEventListener("click", toggleControls);
    toggleFramesButton.addEventListener("click", toggleFrames);

    video.addEventListener('loadedmetadata', function() {
        progress.classList.add("visible");
        this.currentTime = i;
        canvas.width = this.videoWidth;
        canvas.height = this.videoHeight;

        this.addEventListener("timeupdate", onTimeUpdate);
        this.addEventListener("seeked", generateThumbnail);

    });

    function onTimeUpdate() {
        var percent = (video.currentTime / video.duration) * 100;
        progress.value = percent;
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
                video.removeEventListener("timeupdate", onTimeUpdate);
                video.removeEventListener("seeked", generateThumbnail);

                this.currentTime = 0;

                // Generate Thumbnails
                var index = 0;
                thumbnails.forEach(thumbnailSrc => {
                    var thumbnail = document.createElement("img");
                    thumbnail.setAttribute("data-index", index);
                    thumbnail.id = `thumbnail${index++}`;
                    thumbnail.src = thumbnailSrc;

                    thumbnail.addEventListener("click", function() {
                        updateVideoTime(parseInt(this.getAttribute("data-index")));
                        frames.classList.remove("visible");
                    });

                    frames.appendChild(thumbnail);
                });
                video.classList.add("visible");
                framesOn();

                document.addEventListener('keydown', keyListener);

                toggleControlsButton.disabled = false;
                toggleFramesButton.disabled = false;

            }

        }, 'image/jpeg');
    }

});