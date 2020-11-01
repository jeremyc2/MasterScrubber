var input,
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

this.addEventListener("DOMContentLoaded", () => {
    input = document.querySelector('input');
    video = document.getElementById("vid");
    frames = document.getElementById("frames");
    playbackSpeedSlider = document.getElementById("playbackSpeed");
    toggleControlsButton = document.getElementById("toggleControls");
    toggleFramesButton = document.getElementById("toggleFrames");
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');

    var i = 0;

    input.addEventListener('change', function() {
        video.src = URL.createObjectURL(this.files[0]);
    });

    playbackSpeedSlider.addEventListener('input', function() {
        video.playbackRate = this.value;
    });

    video.addEventListener('loadeddata', function() {
        this.currentTime = i;
        canvas.width = this.videoWidth;
        canvas.height = this.videoHeight;
    });

    video.addEventListener("timeupdate", onTimeUpdate);

    function onTimeUpdate() {
        var percent = video.currentTime / video.duration;
        console.log(`${(percent * 100).toFixed(2)}%`);
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

                toggleControlsButton.addEventListener("click", toggleControls);
                toggleFramesButton.addEventListener("click", toggleFrames);

            }

        }, 'image/jpeg');
    }

});