document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('videoElement');
    const canvas = document.getElementById('canvasElement');
    const takePhotoButton = document.getElementById('takePhotoButton');
    const capturedImageContainer = document.getElementById('capturedImageContainer'); // Container for the frame and photos
    const photoSlots = document.querySelectorAll('.photo-slot'); // Get all photo slot divs
    const frameImage = document.getElementById('frameImage'); // Get the frame image element
    const context = canvas.getContext('2d');
    const frameOptions = document.querySelectorAll('input[name="frameDesign"]'); // Get frame design options
    const saveStripButton = document.getElementById('saveStripButton');
    const countdownElement = document.getElementById('countdown');

    let photosTaken = 0;
    const maxPhotos = photoSlots.length; // Should be 4 if you have 4 .photo-slot divs in index.html

    console.log("Max photos per strip (based on .photo-slot count):", maxPhotos);


    const countdownDuration = 3;
    let countdownTimer;
    let isSequenceRunning = false;

    // *** Define your PNG frame data here ***
    const frameDesigns = {
        'Photoism Blue Full.png': {
            imageUrl: 'images/Photoism Blue Full.png', // Path to the full-size Photoism frame image
            // --- Slot positions based on your ORIGINAL measurements (62, 175, 509x769 etc.) and 1200x1800 PNG ---
            slotPositions: [
                { top: '9.72%', left: '5.17%', width: '42.42%', height: '42.72%' },
                { top: '9.72%', left: '52.17%', width: '42.42%', height: '42.72%' },
                { top: '55.00%', left: '5.17%', width: '42.42%', height: '42.72%' },
                { top: '55.00%', left: '52.17%', width: '42.42%', height: '42.72%' }
            ]
        },
        'Cinnamoroll (1).png': {
             imageUrl: 'images/Cinnamoroll (1).png', // Path to the full-size Cinnamoroll frame image
            // --- Your FINE-TUNED percentages for the Cinnamoroll frame (based on 300x450 display) ---
             slotPositions: [
                { top: '13.37%', left: '0%', width: '50%', height: '40.71%' }, // Slot 1 - Fine-tuned
                { top: '13.37%', left: '50%', width: '50%', height: '40.71%' }, // Slot 2 - Fine-tuned
                { top: '55.13%', left: '0%', width: '50%', height: '40.71%' }, // Slot 3 - Fine-tuned
                { top: '55.13%', left: '50%', width: '50%', height: '40.71%' }  // Slot 4 - Fine-tuned
             ]
            // --- End of your FINE-TUNED percentages ---
        },
        // --- New My Melody Frame Entry ---
        'MyMelody (1).png': {
            imageUrl: 'images/MyMelody (1).png', // Path to the full-size My Melody frame image
            // --- Using the SAME fine-tuned slot positions as the Cinnamoroll frame ---
             slotPositions: [
                { top: '13.37%', left: '0%', width: '50%', height: '40.71%' }, // Slot 1
                { top: '13.37%', left: '50%', width: '50%', height: '40.71%' }, // Slot 2
                { top: '55.13%', left: '0%', width: '50%', height: '40.71%' }, // Slot 3
                { top: '55.13%', left: '50%', width: '50%', height: '40.71%' }  // Slot 4
             ]
        }
        // Add more frame designs as objects here
    };
     // *** End of PNG frame data definition ***


    // Function to apply the selected frame style and slot positions
    function applyFrame(frameValue) {
        console.log("Attempting to apply frame:", frameValue);
        const frameData = frameDesigns[frameValue];
        if (frameData) {
            console.log("Frame data found. Frame Data object:", frameData);
             // --- Set the src of the frame image element ---
            if (frameImage) {
                frameImage.src = frameData.imageUrl;
                console.log("Frame image source set to:", frameImage.src);
            } else {
                console.error("Error: frameImage element (#frameImage) not found in HTML! Please check index.html.");
            }

            // Apply the stored positions and sizes to the photo slot divs
            frameData.slotPositions.forEach((pos, index) => {
                if (photoSlots[index]) {
                    photoSlots[index].style.top = pos.top;
                    photoSlots[index].style.left = pos.left;
                    photoSlots[index].style.width = pos.width;
                    photoSlots[index].style.height = pos.height;
                    // Clear any previous photo in this slot
                    photoSlots[index].innerHTML = '';
                    console.log(`Applied position to slot ${index + 1}: top=${pos.top}, left=${pos.left}, width=${pos.width}, height=${pos.height}`);
                } else {
                    console.error("Not enough photo slot divs (.photo-slot) found in HTML for frame data.");
                }
            });
             // Reset photos taken counter and button state when frame changes
            photosTaken = 0;
             console.log("Photos taken count reset to:", photosTaken);
            // Ensure Take Photo button is enabled when frame changes and no sequence is running
            if (!isSequenceRunning) {
                takePhotoButton.disabled = false;
                takePhotoButton.textContent = 'Take Photo';
            }
            // Ensure Save button is hidden when frame changes
            saveStripButton.style.display = 'none';

        } else {
            console.error("Frame design data not found for value:", frameValue);
        }
    }

    async function enableCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            console.log("Camera enabled successfully.");
            // Ensure Take Photo button is enabled if camera is successful and no sequence is running
            if (!isSequenceRunning) {
                 takePhotoButton.disabled = false;
                 takePhotoButton.textContent = 'Take Photo';
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                 alert('Camera access denied. Please allow camera permission in your browser settings.');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                 alert('No camera found. Please ensure a camera is connected and enabled.');
            } else {
                 alert('Could not access the camera. Please make sure you have granted permission. Error: ' + error.name);
            }
            takePhotoButton.disabled = true;
            takePhotoButton.textContent = 'Camera Error';
        }
    }

    function startCountdown() {
        console.log("Starting countdown for photo " + (photosTaken + 1) + "...");
        let count = countdownDuration;
        countdownElement.textContent = count;
        countdownElement.style.display = 'block'; // Show the countdown

        countdownTimer = setInterval(() => {
            count--;
            countdownElement.textContent = count;
            console.log("Countdown:", count);

            if (count === 0) {
                clearInterval(countdownTimer);
                // countdownElement.style.display = 'none'; // Hide the countdown after it finishes (handled in takePhoto)
                console.log("Countdown finished.");
                takePhoto(); // Call takePhoto after countdown
            }
        }, 1000);
    }

    function takePhoto() {
         console.log("Attempting to take photo " + (photosTaken + 1) + " (Index " + photosTaken + ")");
        // Hide countdown immediately when photo is taken
        countdownElement.style.display = 'none';

        if (video.srcObject && photosTaken < maxPhotos) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageDataURL = canvas.toDataURL('image/png');

            const img = document.createElement('img');
            img.src = imageDataURL;
            img.alt = 'Captured Photo ' + (photosTaken + 1);

            const currentSlot = photoSlots[photosTaken]; // Get the slot based on photosTaken index
             if (currentSlot) {
                console.log("Found slot for index:", photosTaken, "Element:", currentSlot);
                currentSlot.innerHTML = ''; // Clear any existing content
                currentSlot.appendChild(img); // Append the captured photo
                console.log('Photo ' + (photosTaken + 1) + ' placed in slot ' + (photosTaken + 1) + ' (Index ' + photosTaken + ')');
             } else {
                 console.error("Could not find photo slot for index:", photosTaken);
             }

            console.log("Value of photosTaken before increment:", photosTaken);
            photosTaken++;
            console.log("Value of photosTaken after increment:", photosTaken);


            console.log('Total photos taken so far:', photosTaken);

            if (photosTaken === maxPhotos) {
                console.log('Photobooth strip is full! Sequence complete.');
                takePhotoButton.disabled = true;
                takePhotoButton.textContent = 'Strip Full';
                saveStripButton.style.display = 'inline-block';
                isSequenceRunning = false;
                console.log('Sequence finished. Save button displayed.');

            } else {
                console.log("Strip not full (" + photosTaken + "/" + maxPhotos + "), starting next countdown.");
                 // Only start the next countdown if there are more photos to take
                startCountdown();
            }

        } else if (photosTaken >= maxPhotos) {
             console.log('Attempted to take photo but strip is full (during sequence). photosTaken:', photosTaken, 'maxPhotos:', maxPhotos);
             isSequenceRunning = false;
        } else {
             console.log('Attempted to take photo but camera is not available (during sequence).');
             isSequenceRunning = false;
             alert('Camera feed is not available.');
        }
    }


    takePhotoButton.addEventListener('click', () => {
         console.log("Take Photo button clicked.");
         // Ensure button is enabled AND camera is available before starting sequence
         if (video.srcObject && photosTaken < maxPhotos && !takePhotoButton.disabled && !isSequenceRunning) {
             isSequenceRunning = true;
             console.log("Starting photo sequence.");
             takePhotoButton.disabled = true; // Disable button immediately when sequence starts
             startCountdown();
         } else if (photosTaken >= maxPhotos) {
             alert('The photobooth strip is already full!');
         } else if (!video.srcObject) {
              alert('Camera feed is not available.');
         } else if (isSequenceRunning) {
             console.log("Sequence is already running.");
         }
    });


    frameOptions.forEach(option => {
        option.addEventListener('change', function() {
            console.log('Frame design option changed:', this.value);
            applyFrame(this.value);
        });
    });


    saveStripButton.addEventListener('click', () => {
        console.log("Save button clicked.");
        // --- Use html2canvas on capturedImageContainer which now contains layered elements ---
        html2canvas(capturedImageContainer, {
            allowTaint: true,
            useCORS: true,
            // --- Set the scale factor to 4 to render at 1200x1800 (4 * 300x450) ---
            scale: 4
            // --- Removed width and height options ---
            // width: 1200,
            // height: 1800,
        }).then(canvas => {
            const imageDataURL = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = imageDataURL;
            link.download = 'photobooth-strip.png';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log("Photo strip saved!");
        }).catch(error => {
             console.error("Error capturing photobooth strip:", error);
             alert("Error saving photo strip. Check console for details.");
        });
    });

    // --- Initialization ---
    console.log("Initializing...");
    console.log("Photo slot elements found (initial):", photoSlots);
     console.log("Initial photosTaken value:", photosTaken);
     // Check if the frameImage element exists on initialization
     if (frameImage) {
         console.log("frameImage element found:", frameImage);
     } else {
         console.error("Error: frameImage element (#frameImage) NOT FOUND on initialization! Please check index.html.");
     }
     // Ensure buttons are in their default state on load
     takePhotoButton.disabled = true; // Disable until camera is ready or frame is applied
     takePhotoButton.textContent = 'Loading...';
     saveStripButton.style.display = 'none';


    const initialFrame = document.querySelector('input[name="frameDesign"]:checked');
    if (initialFrame) {
        applyFrame(initialFrame.value);
        console.log("Initial frame applied based on checked radio button.");
    } else {
         console.error("No initial frame design selected by default in HTML!");
         const firstFrameKey = Object.keys(frameDesigns)[0];
         if(firstFrameKey) {
             applyFrame(firstFrameKey);
             console.log("Applying first frame as fallback default:", firstFrameKey);
         } else {
              console.error("Error: No frame designs available. Check script.js frameDesigns object.");
               alert("Error: No frame designs available. Check script.js frameDesigns object.");
         }
    }

    // Enable camera after initial setup
    enableCamera();
});