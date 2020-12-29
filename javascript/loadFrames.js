document.addEventListener("DOMContentLoaded", () => {

    var i;

    function generateThumbnail() {

        if(!isLoading)
            return;

        context.drawImage(tempVideo, 0, 0);
        canvas.toBlob(blob => {

            if(!isLoading)
                return;
                
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
                        framesOff();
                    });

                    frames.appendChild(thumbnail);
                });

            }

        }, 'image/jpeg');
    }

    input.addEventListener('change', function() {

        if(this.files.length == 0)
            return;

        isLoading = true;
        i = 0;

        video.classList.add("visible");

        progress.value = 0;
        progress.classList.add("visible");
        
        downloadFrameButton.disabled = true;
        toggleFramesButton.disabled = false;

        framesOff();

        [...document.querySelectorAll("#frames > img")].forEach(el => {
            el.parentNode.removeChild(el);
        });

        thumbnails = [];

        var url = URL.createObjectURL(this.files[0]);

        tempVideo.src = url;
        video.src = url;
    });

    tempVideo.addEventListener('loadeddata', function() {

        this.currentTime = i;
        canvas.width = this.videoWidth;
        canvas.height = this.videoHeight;

        downloadFrameButton.disabled = false;

        this.addEventListener("timeupdate", function updateProgress() {

            if(isNaN(tempVideo.duration) | tempVideo.duration == 0)
                return;

            var percent = (tempVideo.currentTime / tempVideo.duration) * 100;

            progress.value = percent;

        });

    });

    tempVideo.addEventListener("seeked", generateThumbnail);

});