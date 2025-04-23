document.addEventListener('DOMContentLoaded', () => {
    console.log("Script started!"); // Add this line here

    const video = document.getElementById('videoElement');
    const canvas = document.getElementById('canvasElement');
    const takePhotoButton = document.getElementById('takePhotoButton');
    const capturedImageContainer = document.getElementById('capturedImageContainer'); // Container for the frame and photos
    const photoSlots = document.querySelectorAll('.photo-slot'); // Get all photo slot divs
    const frameImage = document.getElementById('frameImage'); // Get the frame image element
    const context = canvas.getContext('2d');
    const frameOptions = document.querySelectorAll('input[name="frameDesign"]'); // Get frame design options
    const saveStripButton = document.getElementById('saveStripButton');
    // --- Get the new Retake button ---
    const retakeButton = document.getElementById('retakeButton');
    // --- End Get Retake button ---
    const countdownElement = document.getElementById('countdown');

    // Get the computed width of the capturedImageContainer (on display)
    const containerWidth = capturedImageContainer.offsetWidth;
    console.log("Captured Image Container Width (on display):", containerWidth);

    // Define the target dimensions for the final saved image
    const finalImageWidth = 1200;
    const finalImageHeight = 1800;
    console.log("Final Image Target Dimensions:", finalImageWidth, "x", finalImageHeight);

    // Define the desired aspect ratio for the photos within the frame (2:3)
    const desiredPhotoAspectRatio = 2 / 3;


    let photosTaken = 0;
    const maxPhotos = photoSlots.length; // Should be 4 if you have 4 .photo-slot divs in index.html

    console.log("Max photos per strip (based on .photo-slot count):", maxPhotos);


    const countdownDuration = 3;
    let countdownTimer;
    let isSequenceRunning = false;

    // *** Define your PNG frame data here ***
    // NOTE: Height percentages in slotPositions are primarily for display calculation now.
    // The final saved photo height is calculated based on width for 2:3 ratio.
    const frameDesigns = {
        'Photoism Blue Full.png': {
            imageUrl: 'images/Photoism Blue Full.png', // Path to the full-size Photoism frame image
            // --- Slot positions based on your ORIGINAL measurements (62, 175, 509x769 etc.) and 1200x1800 PNG ---
            slotPositions: [
                { top: '9.72%', left: '5.17%', width: '42.42%', height: '42.72%' }, // Note: Height percentage for display
                { top: '9.72%', left: '52.17%', width: '42.42%', height: '42.72%' }, // Note: Height percentage for display
                { top: '55.00%', left: '5.17%', width: '42.42%', height: '42.72%' }, // Note: Height percentage for display
                { top: '55.00%', left: '52.17%', width: '42.42%', height: '42.72%' }  // Note: Height percentage for display
            ]
        },
        'Cinnamoroll (1).png': {
             imageUrl: 'images/Cinnamoroll (1).png', // Path to the full-size Cinnamoroll frame image
            // --- Adjusted percentages for ALL Slots based on user input (final tweaks) ---
             slotPositions: [
                { top: '13.37%', left: '5.7%', width: '43.5%', height: '40.71%' }, // Slot 1 - Adjusted Left and Width
                { top: '13.37%', left: '50%', width: '43.5%', height: '40.71%' }, // Slot 2 - Left changed to 50%
                { top: '55.33%', left: '5.7%', width: '43.5%', height: '40.71%' }, // Slot 3 - Adjusted Top, Left, Width
                { top: '55.33%', left: '50%', width: '43.5%', height: '40.71%' }  // Slot 4 - Adjusted Top, Left changed to 50%, Width
             ]
            // --- End of adjusted percentages ---
        },
        // --- New My Melody Frame Entry (also using Cinnamoroll positions) ---
        'MyMelody (1).png': {
            imageUrl: 'images/MyMelody (1).png', // Path to the full-size My Melody frame image
            // --- Using the SAME adjusted slot positions as Cinnamoroll frame ---
             slotPositions: [
                { top: '13.37%', left: '5.7%', width: '43.5%', height: '40.71%' }, // Slot 1 - Adjusted
                { top: '13.37%', left: '50%', width: '43.5%', height: '40.71%' }, // Slot 2 - Left changed to 50%
                { top: '55.33%', left: '5.7%', width: '43.5%', height: '40.71%' }, // Slot 3 - Adjusted Top, Left, Width
                { top: '55.33%', left: '50%', width: '43.5%', height: '40.71%' }  // Slot 4 - Adjusted Top, Left changed to 50%, Width
             ]
        },
         // --- New Pompompurin Frame Entry (using same positions as Cinnamoroll/My Melody) ---
        'Pompompurin (1).png': { // Key is the full-size image filename
            imageUrl: 'images/Pompompurin (1).png', // Path to the full-size Pompompurin frame image
             // --- Copy the SAME adjusted slot positions from Cinnamoroll/My Melody ---
             slotPositions: [
                { top: '13.37%', left: '5.7%', width: '43.5%', height: '40.71%' }, // Slot 1
                { top: '13.37%', left: '50%', width: '43.5%', height: '40.71%' }, // Slot 2
                { top: '55.33%', left: '5.7%', width: '43.5%', height: '40.71%' }, // Slot 3
                { top: '55.33%', left: '50%', width: '43.5%', height: '40.71%' }  // Slot 4
             ]
             // --- End copied slot positions ---
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

            // Apply the stored positions and sizes to the photo slot divs for DISPLAY
            frameData.slotPositions.forEach((pos, index) => {
                if (photoSlots[index]) {
                    // Set top, left, and width using the percentage from slotPositions
                    photoSlots[index].style.top = pos.top;
                    photoSlots[index].style.left = pos.left;
                    photoSlots[index].style.width = pos.width;

                    // --- Set the height style based on the frame ---
                    // Check if the current frame is Cinnamoroll, My Melody, OR Pompompurin
                    if (frameValue === 'Cinnamoroll (1).png' || frameValue === 'MyMelody (1).png' || frameValue === 'Pompompurin (1).png') {
                        // For these frames, set a fixed pixel height for display
                        photoSlots[index].style.height = '184px'; // Your desired fixed height for display
                         console.log(`Applied fixed display height to slot ${index + 1} for ${frameValue}: 184px`);
                    } else {
                         // For other frames (like Photoism), calculate height based on width for display (2:3 aspect)
                        const widthPercentage = parseFloat(pos.width); // Get the width percentage as a number
                        const slotWidthPx = (widthPercentage / 100) * containerWidth; // Calculate the slot width in pixels
                        const desiredSlotHeightPx = slotWidthPx * (3 / 2); // Calculate the desired height in pixels (2:3 aspect ratio)
                        photoSlots[index].style.height = desiredSlotHeightPx + 'px';
                         console.log(`Applied calculated display height to slot ${index + 1} for ${frameValue}: ${desiredSlotHeightPx}px`);
                    }
                    // --- End height setting ---


                    console.log(`Slot ${index + 1} calculated dimensions for display: Width=${photoSlots[index].style.width}, Applied Height=${photoSlots[index].style.height}`);
                    console.log(`Applied display position to slot ${index + 1}: top=${pos.top}, left=${pos.left}, width=${pos.width}`);


                    // Clear any previous photo in this slot
                    photoSlots[index].innerHTML = ''; // This clears the displayed image from the slot
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
            // Ensure Retake button is hidden when frame changes
            retakeButton.style.display = 'none';


        } else {
            console.error("Frame design data not found for value:", frameValue);
        }
    }

    async function enableCamera() {
        console.log("Attempting to enable camera...");
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
            // --- Capture the video frame onto the hidden canvas ---
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw the video frame directly onto the canvas with horizontal mirroring
            context.drawImage(video, canvas.width, 0, -canvas.width, canvas.height);

            const imageDataURL = canvas.toDataURL('image/png'); // Get data URL from the canvas

            // Create an img element for display in the photo slot
            const img = document.createElement('img');
            img.src = imageDataURL;
            img.alt = 'Captured Photo ' + (photosTaken + 1);

            // Append the img to the corresponding photo slot div
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
                // --- Set the button text when strip is full (can change this) ---
                takePhotoButton.textContent = 'Strip Complete'; // Changed from 'Strip Full'
                // --- Show Save and Retake buttons ---
                saveStripButton.style.display = 'inline-block';
                retakeButton.style.display = 'inline-block';
                // --- End Show buttons ---
                isSequenceRunning = false;
                console.log('Sequence finished. Save and Retake buttons displayed.');

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
            applyFrame(this.value); // Apply frame resets the photos and enables Take button
        });
    });


    // --- NEW Save Logic using Canvas API (with Object-Fit Cover logic) ---
    saveStripButton.addEventListener('click', () => {
        console.log("Save button clicked (New Canvas Logic).");

        // Create a new canvas for the final image (1200x1800)
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = finalImageWidth;
        finalCanvas.height = finalImageHeight;
        const finalContext = finalCanvas.getContext('2d');

        // Get the current frame data
        const selectedFrameValue = document.querySelector('input[name="frameDesign"]:checked').value;
        const frameData = frameDesigns[selectedFrameValue];
        if (!frameData) {
            console.error("Could not find frame data for saving.");
            alert("Error saving photo strip: Frame data missing.");
            return;
        }

        // Load the frame image
        const frameImg = new Image();
        frameImg.onload = () => {
            // Draw the frame onto the final canvas
            finalContext.drawImage(frameImg, 0, 0, finalImageWidth, finalImageHeight);
            console.log("Frame drawn onto final canvas.");

            // Load and draw each captured photo
            let photosLoaded = 0;
            const capturedPhotos = photoSlots; // Use the photo slot elements

            capturedPhotos.forEach((slot, index) => {
                const imgElement = slot.querySelector('img'); // Get the img element inside the slot
                if (imgElement && imgElement.src) {
                    const photoImg = new Image();
                    photoImg.onload = () => {
                        // --- Implement Canvas Object-Fit Cover logic ---
                        const sourceAspect = photoImg.width / photoImg.height;
                        const destAspect = desiredPhotoAspectRatio; // Use the desired 2:3 aspect ratio (2/3)

                        let sourceX = 0, sourceY = 0, sourceWidth = photoImg.width, sourceHeight = photoImg.height;
                        let destX, destY, destWidth, destHeight;

                        // Get destination rectangle dimensions based on frame slot percentages and final canvas size
                        const pos = frameData.slotPositions[index];
                        destX = parseFloat(pos.left) / 100 * finalImageWidth;
                        destY = parseFloat(pos.top) / 100 * finalImageHeight;
                        destWidth = parseFloat(pos.width) / 100 * finalImageWidth;
                        destHeight = destWidth * (3 / 2); // Ensure destination has 2:3 aspect ratio

                        if (sourceAspect > destAspect) {
                            // Source is wider than destination, crop horizontally from source
                            sourceWidth = photoImg.height * destAspect;
                            sourceX = (photoImg.width - sourceWidth) / 2;
                        } else {
                            // Source is taller or same aspect ratio, crop vertically from source
                            sourceHeight = photoImg.width / destAspect;
                            sourceY = (photoImg.height - sourceHeight) / 2;
                        }

                        // Draw the cropped source image onto the calculated destination rectangle on the final canvas
                        finalContext.drawImage(photoImg, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
                        console.log(`Photo ${index + 1} drawn with object-fit cover. Source: (${sourceX}, ${sourceY}, ${sourceWidth}, ${sourceHeight}), Dest: (${destX}, ${destY}, ${destWidth}, ${destHeight})`);
                        // --- End Canvas Object-Fit Cover logic ---


                        photosLoaded++;
                        // If all photos are loaded and drawn, save the strip
                        if (photosLoaded === maxPhotos) {
                            console.log("All photos loaded and drawn. Saving final canvas.");
                            const imageDataURL = finalCanvas.toDataURL('image/png');

                            const link = document.createElement('a');
                            link.href = imageDataURL;
                            link.download = 'photobooth-strip.png';

                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            console.log("Photo strip saved successfully!");
                        }
                    };
                    photoImg.onerror = (e) => {
                        console.error("Error loading captured photo image:", e);
                        // Handle error loading photo - maybe draw a placeholder?
                        photosLoaded++; // Still increment to avoid blocking save
                        if (photosLoaded === maxPhotos) {
                             console.log("Attempted to load all photos, some failed. Proceeding to save.");
                             // Even if some photos failed to load, try to save the strip with the loaded ones
                             const imageDataURL = finalCanvas.toDataURL('image/png');

                            const link = document.createElement('a');
                            link.href = imageDataURL;
                            link.download = 'photobooth-strip.png';

                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            console.log("Photo strip saving attempted after some failures.");

                        }
                    };
                    photoImg.src = imgElement.src; // Set the source to the captured photo's data URL (already mirrored)
                } else {
                     console.warn(`Photo slot ${index + 1} is empty or missing image source.`);
                      photosLoaded++; // Still increment if slot is empty
                      if (photosLoaded === maxPhotos) {
                         console.log("Checked all photo slots. Proceeding to save.");
                          // Even if some slots were empty, try to save
                            const imageDataURL = finalCanvas.toDataURL('image/png');

                            const link = document.createElement('a');
                            link.href = imageDataURL;
                            link.download = 'photobooth-strip.png';

                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            console.log("Photo strip saving attempted with some empty slots.");
                     }
                 }
            });
        };
        frameImg.onerror = (e) => {
             console.error("Error loading frame image for saving:", e);
             alert("Error saving photo strip: Could not load frame image.");
        };
        // Set the source for the frame image to trigger loading
        frameImg.src = frameImage.src;
    });
    // --- END NEW Save Logic ---

    // --- Retake Button Click Handler ---
    retakeButton.addEventListener('click', () => {
        console.log("Retake Button clicked. Resetting photobooth.");
        photosTaken = 0; // Reset the counter
        console.log("Photos taken count reset to:", photosTaken);

        // Hide Save and Retake buttons
        saveStripButton.style.display = 'none';
        retakeButton.style.display = 'none';

        // Re-enable Take Photo button and reset its text
        takePhotoButton.disabled = false;
        takePhotoButton.textContent = 'Take Photo';
        console.log("Take Photo button enabled.");


        // Re-apply the current frame. This will clear the photo slots and re-apply positions.
        const currentFrameInput = document.querySelector('input[name="frameDesign"]:checked');
        if (currentFrameInput) {
            applyFrame(currentFrameInput.value);
            console.log("Applied current frame to reset display.");
        } else {
            // Fallback if no frame is checked (shouldn't happen if one is checked on load)
             console.warn("No frame checked, applying default frame.");
             const firstFrameKey = Object.keys(frameDesigns)[0];
             if(firstFrameKey) {
                 applyFrame(firstFrameKey);
             }
        }

        // Camera should remain active, no need to re-enable stream unless there was an error
        // The applyFrame function already handles resetting the display.
         console.log("Photobooth reset. Ready for new round.");
    });
    // --- End Retake Button Click Handler ---


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
     retakeButton.style.display = 'none'; // Ensure retake button is hidden on load


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
              console.error("Error: No frame designs available. Check script.js script.js frameDesigns object.");
               alert("Error: No frame designs available. Check script.js script.js frameDesigns object.");
         }
    }

    // Enable camera after initial setup - This call happens after DOMContentLoaded
    // We need to make sure the script is actually running for this to work!
    enableCamera();
});